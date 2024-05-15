import axios from "axios";

// eslint-disable-next-line import/no-cycle
import { Server, serverAddress } from "../api_client/apiClient";
import { notification } from "../service/notifications";
import type { PigPhoto } from "./photosActions.types";

export type UserPhotosGroup = {
  userId: number;
  photos: PigPhoto[];
};

export function downloadPhotos(image_hashes: string[]) {
  let fileUrl;

  const startDownloadProcess = () => {
    notification.downloadStarting();
    return Server.post("photos/download", {
      image_hashes,
    });
  };
  const checkDownloadStatus = job_id =>
    Server.get(`photos/download?job_id=${job_id}`)
      .then(response => response.data.status)
      .catch(error => console.error("Error checking download status:", error));

  const getDownloadFile = () => axios.get<Blob>(`${serverAddress}/media/zip/${fileUrl}`, { responseType: "blob" });

  const deleteDownloadFile = () =>
    Server.delete(`delete/zip/${fileUrl}`)
      .then(response => response.data.status)
      .catch(error => {
        console.error("Error Deleting the file :", error);
      });

  return function () {
    startDownloadProcess()
      .then(response => {
        fileUrl = response.data.url;
        let checkStatusInterval;

        const checkStatus = () => {
          checkDownloadStatus(response.data.job_id)
            .then(status => {
              if (status === "SUCCESS") {
                clearInterval(checkStatusInterval); // Stop checking once successful

                getDownloadFile()
                  .then(downlaod_response => {
                    const downloadUrl = window.URL.createObjectURL(
                      new Blob([downlaod_response.data], { type: "application/zip" })
                    );

                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.setAttribute("download", "file.zip");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    notification.downloadCompleted();
                    deleteDownloadFile();
                  })
                  .catch(error => {
                    console.error("Error downloading:", error);
                  });
              } else if (status === "FAILURE") {
                notification.downloadFailed();
                clearInterval(checkStatusInterval); // Stop checking on failure as well
                throw new Error("Download failed.");
              }
            })
            .catch(error => {
              console.error("Error checking download status:", error);
            });
        };
        // Set up an interval to periodically check the download status
        checkStatusInterval = setInterval(checkStatus, 3000);
      })

      .catch(error => {
        console.error("Error:", error);
      });
  };
}
