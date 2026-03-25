export function errorHandler(err, req, res, next) {

    console.error("❌ ERROR:", err);

    let status = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        status = 400;
        message = err.message;
    }

    if (err.name === "CastError") {
        status = 400;
        message = "Invalid ID";
    }

    if (err.code === 11000) {
        status = 400;
        message = "Duplicate field value";
    }

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack
        })
    });
}