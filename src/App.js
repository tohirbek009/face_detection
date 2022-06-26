// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow DONE
// 8. Draw functions DONE

// Face Mesh - https://github.com/tensorflow/tfjs-models/tree/master/facemesh

import React, {useRef, useEffect} from "react";
import {useState} from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
// OLD MODEL
//import * as facemesh from "@tensorflow-models/facemesh";

// NEW MODEL
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import {drawMesh} from "./utilities";

function App() {
    let counter = 0;
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [faces, setFaces] = useState([])
    const [isCheatingFound, setIsCheatingFound] = useState(false);
    const [objCount, setObjCount] = useState(0);
    const [isCheatingWithFaceConfidance, setIsCheatingWithFaceConfidance] = useState(false)
    const [faceViewConfidance, setFaceViewConfidance] = useState(0);

    //  Load posenet
    const runFacemesh = async () => {
        // OLD MODEL
        // const net = await facemesh.load({
        //   inputResolution: { width: 640, height: 480 },
        //   scale: 0.8,
        // });
        // NEW MODEL
        const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
        setInterval(() => {
            detect(net);
        }, 10);
    };

    const detect = async (net) => {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            // Set video width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            // Set canvas width
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            // Make Detections
            // OLD MODEL
            //       const face = await net.estimateFaces(video);
            // NEW MODEL
            const face = await net.estimateFaces({input: video});

            if(face.length !== 1){
                counter++;
                setObjCount(objCount + 1);
            }else if(face[0].faceInViewConfidence < 0.8){
                counter++
                setIsCheatingWithFaceConfidance(true);
                setFaceViewConfidance(face[0].faceInViewConfidence * 100)
            }else counter = 0;

            console.log(counter, face.length !== 1)

            if(counter > 15){
                setIsCheatingFound(true);
            }else setIsCheatingFound(false);

            setFaces(face)

            // Get canvas context
            const ctx = canvasRef.current.getContext("2d");
            requestAnimationFrame(() => {
                drawMesh(face, ctx)
            });
        }
    };


    useEffect(() => {
        runFacemesh()
    }, []);

    return (
        <div className="App">
            <header className="App-header">

                <h1>Face Count: {faces.length}</h1>
                {
                    isCheatingFound &&
                    <span>Cheating status: with face confidance {`${faceViewConfidance} %`}</span>
                }

                <span>{isCheatingFound ? 'Warning! Please, stop cheating' : "Ok! Cheating was stopped"}</span>

                <Webcam
                    ref={webcamRef}
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        zindex: 9,
                        width: 440,
                        height: 280,
                    }}
                />

                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        zindex: 9,
                        width: 440,
                        height: 280,
                    }}
                />
            </header>
        </div>
    );
}

export default App;
