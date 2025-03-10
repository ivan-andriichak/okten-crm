import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, [navigate]);

  return (
    <div style={imageStyle}>
      <img
        src={
          'https://onextrapixel.com/wp-content/uploads/2017/04/404-pages.jpg'
        }
        alt="Error 404"
      />
    </div>
  );
};
const imageStyle = {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export { ErrorPage };
