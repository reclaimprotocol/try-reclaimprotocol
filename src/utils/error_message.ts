// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorMessage = (error: any) => {
  return (typeof error === "object" && error && "message" in error && typeof error.message === "string")
    ? error.message
    : error.toString();
};
