import { showNotification } from "@mantine/notifications";

import i18n from "../../i18n";

async function updateUser(userDetails) {
  try {
    // Send the update request to the backend
    const response = await fetch("/api/update-user-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    });

    // Handle the response from the backend
    if (response.ok) {
      // Show success notification
      showNotification({
        message: i18n.t("toasts.updateuser", { username: userDetails.username }),
        title: i18n.t("toasts.updateusertitle"),
        color: "teal",
      });
    } else {
      const errorData = await response.json();
      // Show error notification
      showNotification({
        message: errorData.error || i18n.t("toasts.updateusererror"),
        title: i18n.t("toasts.updateusertitle"),
        color: "red",
      });
    }
  } catch (error) {
    // Handle any request error
    console.error("Request failed", error);
    showNotification({
      message: i18n.t("toasts.updateusererror"),
      title: i18n.t("toasts.updateusertitle"),
      color: "red",
    });
  }
}

export const user = {
  updateUser,
};
