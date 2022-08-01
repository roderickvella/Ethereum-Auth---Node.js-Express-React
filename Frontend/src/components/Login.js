import React from "react";

export function Login({ login }) {

    return (
        <div className="container">
            <div className="row justify-content-md-center">
                <div className="col-6 p-4 text-center">
                    <p>Sign Message</p>
                    <button
                        className="btn btn-warning"
                        type="button"
                        onClick={login}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}