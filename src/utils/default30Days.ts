export const default30Days = () => {
  const till = new Date();
  const since = new Date().setHours(0, 0, 0, 0);

  // since.setDate(till.getDate() );

  return {
    title: "Last 1 day",
    alias: "last 1 day",
    period: {
      since: new Date(since).toISOString(),
      until: till.toISOString(),
    },
  };
};
