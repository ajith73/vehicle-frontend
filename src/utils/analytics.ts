import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-WTJGSXDEHG");
};

export const trackPage = () => {
  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname + window.location.search,
  });
};
