import { ErrorHandler } from '@angular/core';

export class AppErrorHandler implements ErrorHandler {
    handleError(error) {
        console.log(error);

        if (error.originalError && error.originalError.StatusText) {
            alert (error.originalError.StatusText);
            return;
        }

        if (error.originalError && error.originalError.error) {
            alert (error.originalError.error);
            return;
        }

        if (error.originalError) {
            alert (error.originalError);
            return;
        }
        //alert ("Onbekende fout");
        alert('Oeps, een onverwachte fout.');
    }
}
