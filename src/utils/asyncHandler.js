//Promise resolve wrapper
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))  //we simply returning function inside wrapper
    .catch((error) => next(error));  
  };
};

export {asyncHandler}

//try catch...........................

// const asyncHandler = (func) => {
//   async (req, res, next) => {
//     try {
//       await func(req, res, next);
//     } catch (error) {
//         console.log(error)
//     }
//   };
// };
