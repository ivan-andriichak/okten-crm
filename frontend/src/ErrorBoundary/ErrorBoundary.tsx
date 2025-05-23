import { Component, ErrorInfo, FC, ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../components/Button/Button';
import css from './ErrorBoundary.module.css';
import SupportEmail from '../components/SupportEmail/SupportEmail';
import { addNotification } from '../store';

const NotifyError: FC<{ error: Error }> = ({ error }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      addNotification({
        message: `An unexpected error occurred: ${error.message}`,
        type: 'error',
        duration: 10000,
      }),
    );
  }, [dispatch, error]);
  return null;
};

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className={css.errorContainer}>
          <h1>Oops! Something went wrong.</h1>
          <p>
            Please try reloading the page or contact support at .
            <div>
              <br />
              <Button>
                <SupportEmail />
              </Button>
            </div>
          </p>
          <Button variant="primary" onClick={this.handleReload}>
            Reload Page
          </Button>
          <NotifyError error={this.state.error} />
        </div>
      );
    }
    return this.props.children;
  }
}
