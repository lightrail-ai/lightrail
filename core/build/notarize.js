const { notarize } = require("@electron/notarize");

module.exports = async (context) => {
  if (process.platform !== "darwin") return;

  console.log("aftersign hook triggered, start to notarize app.");

  if (!process.env.CI) {
    console.log(`skipping notarizing, not in CI.`);
    return;
  }

  if (!("APPLEID" in process.env && "APPLEIDPASS" in process.env)) {
    console.warn(
      "skipping notarizing, APPLEID and APPLEIDPASS env variables must be set."
    );
    return;
  }

  const appId = "com.lightrail.app";

  const { appOutDir } = context;

  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      appBundleId: appId,
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`done notarizing ${appId}.`);
};
