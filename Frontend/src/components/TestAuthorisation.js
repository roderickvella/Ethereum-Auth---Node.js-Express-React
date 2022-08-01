import React from "react";

export function TestAuthorisation({ getAuthorisedData }) {

    return (
        <div className="container">
            <div className="row justify-content-md-center">
                <div className="col-6 p-4 text-center">
                    <p>The below button is shown because you just logged in. Press the 'Get Data' button to check if the backend server accepts this authorised request (jwt token will be set in the header)</p>
                    <button
                        className="btn btn-warning"
                        type="button"
                        onClick={getAuthorisedData}
                    >
                        Get Data
                    </button>
                </div>
            </div>
        </div>
    );
}