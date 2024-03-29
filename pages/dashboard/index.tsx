import {
  Avatar,
  CircularProgress,
  IconButton,
  Slide,
  Snackbar,
} from "@material-ui/core";
import {
  EmailRounded,
  ExitToAppRounded,
  LocationCity,
  PhoneOutlined,
} from "@material-ui/icons";
import { useRouter } from "next/router";
import React, { forwardRef, useEffect, useState } from "react";
import HealthCard from "../../src/components/dashboard/HealthCard";
import { useStateValue } from "../../src/context/StateProvider";
import dashboardStyles from "../../styles/pages/dashboard/Dashboard.module.css";
import { Bar, Doughnut, Line, PolarArea, Radar } from "react-chartjs-2";
import _ from "lodash";
import { Alert } from "@material-ui/lab";
import { TransitionProps } from "@material-ui/core/transitions";
import { motion } from "framer-motion";
import { pageAnimationVariants } from "../../src/services/animationUtils";
import { getMedicalDataOfUserID } from "../../src/services/firebaseUtils";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getChartData = (
  userMedicalData: {
    issue: string;
    fees: number;
    medicines: number;
    on: any;
  }[]
) => {
  const labels: string[] = [];
  const costData: number[] = [];
  const backgroundColor: string[] = [];
  let feesArray: number[] = [];
  let medicinesArray: number[] = [];
  userMedicalData.forEach((medicalData) => {
    labels.push(medicalData.issue);
    costData.push(medicalData.fees + medicalData.medicines);
    backgroundColor.push(
      `rgb(${Math.floor(Math.random() * 244)}, ${Math.floor(
        Math.random() * 244
      )}, ${Math.floor(Math.random() * 244)})`
    );

    feesArray.push(Number(medicalData?.fees));
    medicinesArray.push(Number(medicalData?.medicines));
  });
  const fees = _.sum(feesArray);
  const medicines = _.sum(medicinesArray);
  return [
    {
      labels,
      datasets: [
        {
          label: "Diseases and expenditure on them in rupees",
          borderColor: "#212121",
          data: costData,
          backgroundColor,
        },
      ],
    },
    {
      fees,
      medicines,
      totalExpenditure: fees + medicines,
    },
  ];
};

const Dashboard = () => {
  const router = useRouter();
  const [{ user }] = useStateValue();
  const [openAlert, setOpenAlert] = useState(false);
  const [loadingHealthData, setLoadingHealthData] = useState(false);
  const [filter, setFilter] = useState("monthly");
  const [expenditureData, setExpenditureData] = useState<any>({
    fees: 0,
    medicines: 0,
    totalCost: 0,
  });
  const [chartData, setChartData] = useState<any>();
  const [medicalData, setMedicalData] = useState<
    {
      id: string;
      issue: any;
      fees: any;
      medicines: any;
      on: any;
      patientID: any;
      state: any;
      city: any;
    }[]
  >();

  const loadLatestMedicalData = () => {
    setLoadingHealthData(true);
    getMedicalDataOfUserID(user.id, filter).then((data) => {
      setMedicalData(data);
      const response = getChartData(data);
      setChartData(response[0]);
      setExpenditureData(response[1]);
      setLoadingHealthData(false);
    });
  };

  useEffect(() => {
    if (user) {
      loadLatestMedicalData();
    }
  }, [user, filter]);

  const copyID = () => {
    navigator.clipboard.writeText(user?.id);
    setOpenAlert(true);
  };

  const logout = () => {
    localStorage.clear();
    location.reload();
  };

  return user?.id ? (
    <motion.div
      className={dashboardStyles.dashboard}
      variants={pageAnimationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={dashboardStyles.profileTextAndHealthDataContainer}>
        <div className={dashboardStyles.backButton}>
          <IconButton onClick={logout} style={{ borderRadius: 7 }}>
            <ExitToAppRounded />
            &nbsp;<span>Log out</span>
          </IconButton>
        </div>
        <div className={dashboardStyles.profileTextDataContainer}>
          <div className={dashboardStyles.photo}>
            <Avatar
              className={dashboardStyles.avatar}
              alt={
                user?.name.split(" ").length >= 2
                  ? `${user?.name.split(" ")[0][0]}${
                      user?.name.split(" ")[1][0]
                    }`
                    ? user?.name.split(" ").length === 1
                      ? user?.name.split(" ")[0][0]
                      : ""
                    : ""
                  : ""
              }
              src={user?.photoURL || undefined}
            />
          </div>
          <h3 className={dashboardStyles.id} onClick={copyID}>
            IUMC ID- {user?.id}
          </h3>
          <h1 className={dashboardStyles.name}>{user?.name}</h1>
          <h3 className={dashboardStyles.phoneNumber}>
            <PhoneOutlined />
            &nbsp;&nbsp;
            <span>{user?.phoneNumber}</span>
          </h3>
          <h3 className={dashboardStyles.email}>
            <EmailRounded />
            &nbsp;&nbsp;
            <span>{user?.email}</span>
          </h3>
          <h3 className={dashboardStyles.address}>
            <LocationCity />
            &nbsp;&nbsp;
            <span>{user?.address}</span>
          </h3>
          {user?.userType === "doctor" ? (
            <button
              className={dashboardStyles.doctorButton}
              onClick={() => router.push("/doctor")}
            >
              {"Go to Doctor's panel"}
            </button>
          ) : (
            <></>
          )}
        </div>
        <div className={dashboardStyles.healthDataContainer}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={dashboardStyles.filter}
          >
            <option value="monthly">Monthly</option>
            <option value="3months">3 Months</option>
            <option value="6month">6 Months</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
          <h2 className={dashboardStyles.title}>Health data</h2>
          {loadingHealthData ? (
            <CircularProgress color="secondary" size={24} />
          ) : medicalData?.length ? (
            medicalData.map(
              (data: {
                id: string;
                on: number;
                fees: number;
                medicines: number;
                issue: string;
                patientID: string;
                state: string;
                city: string;
              }) => (
                <HealthCard
                  key={data.id}
                  id={data.id}
                  date={data?.on}
                  fees={data?.fees}
                  medicines={data?.medicines}
                  issue={data?.issue}
                  patientID={data?.patientID}
                  state={data?.state}
                  city={data?.city}
                />
              )
            )
          ) : (
            <p style={{ color: "white" }}>No previous records</p>
          )}
        </div>
      </div>
      <div className={dashboardStyles.graphContainer}>
        <div className={dashboardStyles.expenditure}>
          <h3>Expenditure</h3>
          <p className={dashboardStyles.cost}>Fees- ₹{expenditureData.fees}</p>
          <p className={dashboardStyles.cost}>
            Medicines- ₹{expenditureData.medicines}
          </p>
          <p className={dashboardStyles.cost}>
            Total- ₹{expenditureData.totalExpenditure}
          </p>
        </div>
        {loadingHealthData ? (
          <CircularProgress color="secondary" size={24} />
        ) : medicalData?.length ? (
          <>
            <div className={dashboardStyles.chart}>
              <Doughnut data={chartData} />
            </div>
            <div className={dashboardStyles.chart}>
              <Line data={chartData} />
            </div>
            <div className={dashboardStyles.chart}>
              <Bar data={chartData} />
            </div>
            <div className={dashboardStyles.chart}>
              <PolarArea data={chartData} />
            </div>
          </>
        ) : (
          <p style={{ color: "white" }}>No previous records</p>
        )}
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        key={new Date().getMilliseconds()}
        TransitionComponent={Transition}
        autoHideDuration={4444}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity={"success"}
          style={{ width: "100%" }}
        >
          IUMAC ID (Indian Unique Medical Card ID) copied!
        </Alert>
      </Snackbar>
    </motion.div>
  ) : (
    <motion.div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
      }}
      variants={pageAnimationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <CircularProgress color="secondary" size={24} />
    </motion.div>
  );
};

export default Dashboard;
