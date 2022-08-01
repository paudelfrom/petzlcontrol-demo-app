const Reducer = (state, action) => {
  switch (action.type) {
    case "SET_BADGE":
      return {
        ...state,
        badge: action.payload,
      };

    default:
      return state;
  }
};

export default Reducer;
