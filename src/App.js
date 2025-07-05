import React, { useState } from "react";
import Webcam from "react-webcam";
import logo from './fluffy.svg';

const FACING_MODE_USER = { facingMode: 'user' }; //Front Camera
const FACING_MODE_ENVIRONMENT = { facingMode: { exact: 'environment' } }; //Back Camera

export default function OurApp() {
  const [takingPic, setTakingPic] = useState(false);
  function handleClick() {
    setTakingPic(true);
  }
  return (
  takingPic ? (
        <div>
        <CameraComponent/>
        </div>
      ) : (
        <div>
        <img src={logo} alt="FLuffy logo" height={100} width={100} />
        <Button handleClick={() => handleClick()} text="Click on me!"/>
        </div>
      )
    );
}

function Button({handleClick, text}){
    return (
        <button onClick={handleClick}>
          {text}
        </button>
  );
}

function CameraComponent() {
  const webcamRef = React.useRef(null);
  const [image, setImage] = useState(null);
  const [videoConstraints, setVideoConstraints] = useState(FACING_MODE_USER);

  // a function that returns the list of media devices returning video input
  const getListOfVideoInputs = async () => {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    return mediaDevices.filter(device => device.kind === 'videoinput');
  }

  // a function to switch between the different video inputs 
  const switchCamera = async () => {
    const videoInpuList = await getListOfVideoInputs();
    if (videoInpuList.length > 1) {
      const currentVideoConstraints = { ...videoConstraints };

      // If the current constraint is the front camera, switch to the back camera.
      if (JSON.stringify(currentVideoConstraints) === JSON.stringify(FACING_MODE_USER)) {
        setVideoConstraints(FACING_MODE_ENVIRONMENT);
      }
      // If the current constraint is the back camera, switch to the front camera.
      if (JSON.stringify(currentVideoConstraints) === JSON.stringify(FACING_MODE_ENVIRONMENT)) {
        setVideoConstraints(FACING_MODE_USER);
      }
    } else {
      alert('Device have only one camera.');
    }
  };

  // a function to retrieve image from the current media video device
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef, setImage]);

  // a function to reset the image
  const retake = () => setImage(null);

  // a function to upload the image somewhere
  const upload = () => {
    alert('Upload photo'); // TODO: upload to Victor's server
//    setImage(null);
  };

  return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 mb-3 mb-md-0 d-flex flex-column">
            {image ? (
              <img src={image} alt="Captured" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
            )}
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-md-6 mt-2 d-flex justify-content-center align-items-center flex-wrap">
            {image ? (
              <button className="btn btn-primary me-2 mb-2" onClick={retake}>
                Re-Take
              </button>
            ) : (
              <>
                <button className="btn btn-secondary me-2 mb-2" onClick={switchCamera}>
                  Switch Camera
                </button>
                <button className="btn btn-primary me-2 mb-2" onClick={capture}>
                  Take Photo
                </button>
              </>
            )}
            {image && (
              <button className="btn btn-success mb-2" onClick={upload}>
                Upload
              </button>
            )}
          </div>
        </div>
      </div>
  );
}