import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        cb(null, file.fieldname + '-' + Date.now() + '.' + ext)
    },
})

const upload = multer({
    storage: storage,
}).fields([{ name: 'image', maxCount: 1 }])

export default upload
