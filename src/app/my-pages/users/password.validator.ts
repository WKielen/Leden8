import { AbstractControl } from '@angular/forms';

export class PasswordValidators {
    static passwordsShouldMatch(control: AbstractControl) {
        const pw1 = control.get('password1');
        const pw2 = control.get('password2');

        if (pw1.value !== pw2.value) {
            return { passwordsShouldMatch: true };
        }
        return null;
    }
    // static passwordsShouldMatch2(control: AbstractControl) {
    //     const formGroup = control.parent;
    //     if (!formGroup) {
    //         return null;
    //     }

    //     const pw1 = formGroup.get('password1');
    //     const pw2 = formGroup.get('password2');

    //     if (pw1 && pw2 && pw1.value !== pw2.value) {
    //         return { passwordsShouldMatch2: true };
    //     }
    //     return null;
    // }

}
