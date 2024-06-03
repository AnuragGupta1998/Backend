import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp') //destiny folder where file save for tiny timer
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname)

      //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      //   cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  export const upload = multer({ storage })
//   export const upload = multer({ storage: storage })