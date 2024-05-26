import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const CLOUD_NAME = "dlnpuom7o";
const UPLOAD_PRESET = "wi57fatw";

function App() {
  const [video1, setVideo1] = useState(null);
  const [video2, setVideo2] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [type, setType] = useState("type1");
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [cldResponse, setCldResponse] = useState({});
  const [allVideos, setAllVideos] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsClicked((prev) => !prev);
    setUploadComplete(false);
    setUploading(true);

    const uniqueUploadId1 = generateUniqueUploadId();
    const uniqueUploadId2 = generateUniqueUploadId();
    const chunkSize = 5 * 1024 * 1024;

    const response1 = await uploadFile(video1, uniqueUploadId1, chunkSize);
    const response2 = await uploadFile(video2, uniqueUploadId2, chunkSize);

    if (response1 && response2) {
      const videoUrls = {
        v1: response1.secure_url,
        v2: response2.secure_url,
      };

      storeVideoUrls(videoUrls);
    }

    setUploadComplete(true);
    setUploading(false);
  };

  const uploadFile = async (file, uniqueUploadId, chunkSize) => {
    if (!file) {
      console.error("Please select a file.");
      return;
    }

    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    const uploadChunk = async (start, end) => {
      const formData = new FormData();
      formData.append("file", file.slice(start, end));
      formData.append("cloud_name", CLOUD_NAME);
      formData.append("upload_preset", UPLOAD_PRESET);
      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

      console.log(
        `Uploading chunk for uniqueUploadId: ${uniqueUploadId}; start: ${start}, end: ${
          end - 1
        }`
      );

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          {
            method: "POST",
            body: formData,
            headers: {
              "X-Unique-Upload-Id": uniqueUploadId,
              "Content-Range": contentRange,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Chunk upload failed.");
        }

        currentChunk++;

        if (currentChunk < totalChunks) {
          const nextStart = currentChunk * chunkSize;
          const nextEnd = Math.min(nextStart + chunkSize, file.size);
          return await uploadChunk(nextStart, nextEnd);
        } else {
          const fetchResponse = await response.json();
          setCldResponse((prevResponse) => ({
            ...prevResponse,
            [file.name]: fetchResponse,
          }));
          console.info("File upload complete.");
          return fetchResponse;
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setUploading(false);
      }
    };

    const start = 0;
    const end = Math.min(chunkSize, file.size);
    return await uploadChunk(start, end);
  };

  const generateUniqueUploadId = () => {
    return `uqid-${Date.now()}`;
  };

  const storeVideoUrls = (videoUrls) => {
    try {
      let storedVideos = JSON.parse(localStorage.getItem("videos")) || [];
      storedVideos.push(videoUrls);
      localStorage.setItem("videos", JSON.stringify(storedVideos));
      console.log("Video URLs stored successfully:", videoUrls);
    } catch (error) {
      console.error("Error storing video URLs in local storage:", error);
    }
  };

  const handleVideo1 = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo1(e.target.files[0]);
    }
  };

  const handleVideo2 = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo2(e.target.files[0]);
    }
  };

  const handleType = (e) => {
    setType(e.target.value);
  };
  /*
  const renderAllVideos = () => {
    console.log(allVideos);
    return (
      <div>
        {allVideos.map((video) => (
          <div
            style={{ position: "relative", width: "320px", height: "240px" }}
            key={uuidv4()}
          >
            <video width="320" height="240" controls>
              <source src={video.v1} type="video/mp4" />
            </video>
            <video width="320" height="240" controls>
              <source src={video.v2} type="video/mp4" />
            </video>
          </div>
        ))}
      </div>
    );
  };
  const displayAllVideos = () => {
    let storedVideos = JSON.parse(localStorage.getItem("videos")) || [];
    setAllVideos(storedVideos);
    renderAllVideos();
  };
*/
  const renderOptions = () => {
    return (
      <div className="main-container">
        <h1>Welcome to Video Collager!</h1>
        <p>Select your videos and template here and start collaging! </p>
        <form onSubmit={handleSubmit}>
          <div>
            <input type="file" accept=".mp4" onChange={handleVideo1} />
          </div>
          <div>
            <input type="file" accept=".mp4" onChange={handleVideo2} />
          </div>
          <select onChange={handleType}>
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
          </select>
          <br />
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Collage"}
          </button>
        </form>
        {/*   <button onClick={displayAllVideos}>Get all Videos</button>*/}
      </div>
    );
  };

  const renderType1 = () => {
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            width: "320px",
            height: "240px",
          }}
        >
          {video1 && (
            <div>
              <video width="320" height="240" controls>
                <source src={URL.createObjectURL(video1)} type="video/mp4" />
              </video>
            </div>
          )}
          {video2 && (
            <div>
              <video
                width="320"
                height="240"
                controls
                style={{ position: "relative", top: "-33px" }}
              >
                <source src={URL.createObjectURL(video2)} type="video/mp4" />
              </video>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderType2 = () => {
    return (
      <div style={{ position: "relative", width: "320px", height: "240px" }}>
        {video1 && (
          <video width="320" height="240" autoPlay loop controls>
            <source src={URL.createObjectURL(video1)} type="video/mp4" />
          </video>
        )}
        {video2 && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              width: "80px",
              height: "80px",
            }}
          >
            <video
              width="80"
              height="80"
              autoPlay
              loop
              controls
              style={{ borderRadius: "50%" }}
            >
              <source src={URL.createObjectURL(video2)} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    );
  };

  const renderVideos = () => {
    return <div>{type === "type1" ? renderType1() : renderType2()}</div>;
  };

  return (
    <div className="App">{isClicked ? renderVideos() : renderOptions()} </div>
  );
}

export default App;
