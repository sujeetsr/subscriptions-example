import { Subscription } from 'react-apollo';

class SubscriptionWithComplete extends Subscription {
  /*
  componentDidMount() {
    super.componentDidMount();
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
    super.componentWillUnmount();
  }
  */

  startSubscription = () => {
    const _this = this;
    if (this.querySubscription) {
      return;
    }
    this.querySubscription = this.queryObservable.subscribe({
      next: _this.updateCurrentData,
      error: this.updateError,
      complete: () => {
        console.log('calling complete');
        _this.doComplete();
      }
    });
  }

  doComplete() {
    this.props.onSubscriptionComplete();
  }
}

export default SubscriptionWithComplete;
