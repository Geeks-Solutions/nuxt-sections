/** Give transport and parsing failures the same callback shape as HTTP failures. */
export const toApiError = (error: any) => {
  if (error?.response?.data) return error

  const data = { error: error?.message || 'An unexpected request error occurred.' }
  return {
    data,
    response: { data, status: 0, statusText: data.error },
    cause: error,
  }
}
