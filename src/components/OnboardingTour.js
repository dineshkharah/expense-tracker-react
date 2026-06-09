import React from "react";
import { Tour } from "antd";

// Returns whichever of the two elements is currently visible (rendered with
// a layout box). Desktop nav and mobile dock are mutually exclusive via CSS,
// so this makes the tour target the right one on each device.
const visibleEl = (desktopId, mobileId) => () => {
  const desktop = document.getElementById(desktopId);
  if (desktop && desktop.offsetParent !== null) return desktop;
  const mobile = document.getElementById(mobileId);
  if (mobile && mobile.offsetParent !== null) return mobile;
  return desktop || mobile;
};

// Guided first-time tour (Option B): spotlights real elements, including the
// navigation items, adapting to desktop vs mobile.
const OnboardingTour = ({ open, onClose, summaryRef, calendarRef }) => {
  const steps = [
    {
      title: "Welcome to Trackr 👋",
      description:
        "Let's take a quick tour of how to track your money. It'll only take a few seconds.",
      target: null,
    },
    {
      title: "Your monthly summary",
      description:
        "See your income, expenses and net balance for the month at a glance.",
      target: () => summaryRef?.current,
    },
    {
      title: "Add a transaction",
      description:
        "Record income or an expense manually from here.",
      target: visibleEl("tour-add-desktop", "tour-add-mobile"),
    },
    {
      title: "Scan a bill with AI 📷",
      description:
        "Short on time? From here you can choose Scan Bill - snap a photo and AI fills in the details for you to review.",
      target: visibleEl("tour-add-desktop", "tour-add-mobile"),
    },
    {
      title: "Spending calendar",
      description:
        "Browse your transactions and upcoming recurring payments day by day.",
      target: () => calendarRef?.current,
    },
    {
      title: "Insights & reports 📊",
      description:
        "Explore charts, category breakdowns and monthly reports here.",
      target: visibleEl("tour-insights-desktop", "tour-insights-mobile"),
    },
    {
      title: "You're all set! 🎉",
      description:
        "That's the basics. You can replay this tour anytime from your Profile page.",
      target: null,
    },
  ];

  return <Tour open={open} onClose={onClose} steps={steps} />;
};

export default OnboardingTour;
