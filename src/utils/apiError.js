
class apiError extends Error {
    constructor(
        statuscode, // The HTTP status code representing the type of error (e.g., 400, 404, 500).
        message = "Something went wrong", // A default error message if none is provided.
        error = [],                // Additional error details, usually an array of specific issues.
        statck = ""                // A placeholder for the stack trace, not used here explicitly.
    ) {
        super(message);            // Call the parent Error class's constructor to set the error message.
        this.statuscode = statuscode; // Assign the HTTP status code to the instance.
        this.data = null;          // Initialize the `.data` property to null. It can be used to store additional error-related data.
        this.success = false;      // Set success to `false`, indicating that the API response failed.
        this.error = error;        // Store the additional error details provided.
         

    
        if (statck) {
            this.stack=statck
            
        }else{
            error.captureStackTrace(this,this.constructor)
        }
    }

}
// export default apiError
export{apiError}
// class apiError extends Error {
    //     constructor(
    //         statuscode,
    //         message="Something went wrong",
    //         error=[],
    //         statck=""
    
    //     ) {
    //         super(message)
    //         this.statuscode=statuscode
    //         this.data=null
    //         this.success=false
    //         this.error=error
            
    //     }
    // }
