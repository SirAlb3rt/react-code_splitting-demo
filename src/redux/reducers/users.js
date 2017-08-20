export default function reducer(
  state = {
    users: [],
    page: 1,
    fetching: false,
    fetched: false,
    error: null
  },
  action
) {
  switch (action.type) {
    default:
      return state;
  }
}
