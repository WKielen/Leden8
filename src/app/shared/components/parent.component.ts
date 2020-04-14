import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-parent',
  template: '',

})
export class ParentComponent {

  private observableSubscriptions = [];
  constructor(
    protected snackBar: MatSnackBar,
  ) { }

  public showSnackBar(message: string, consolelog?: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
    });

    if (consolelog) {
      console.log(consolelog);
    }
  }

/***************************************************************************************************
/ When dealing with RxJs Observables and Subscriptions, it can easily happen, that you leak some memory. 
/ That is because your component is destroyed, but the function you registered inside of the observable
/ is not. That way, you not only leak memory but probably also encounter some odd behavior.
/***************************************************************************************************/
  public registerSubscription(subscription: Subscription): void {
    this.observableSubscriptions.push(subscription);
  }

/***************************************************************************************************
/ To prevent memory leajs, make sure to unsubscribe from your subscriptions, when the component is destroyed.
/ One good place to do so, would be the ngOnDestroy lifecycle hook.
/***************************************************************************************************/
  ngOnDestroy() {
    for (let subscription of this.observableSubscriptions) {
      subscription.unsubscribe();
      console.log('kill subscriptions', );
    }
  }
}
