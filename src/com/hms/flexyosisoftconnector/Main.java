package com.hms.flexyosisoftconnector;

import java.util.Date;

import com.ewon.ewonitf.SysControlBlock;
import com.hms.flexyosisoftconnector.JSON.JSONException;

/**
 * Ewon Flexy java demo for OSIsoft Server
 *
 * <p>This demo reads multiple tag values from an Ewon Flexy IO Server and POSTs them to an OSIsoft
 * PI Server.
 *
 * <p>HMS Networks Inc. Solution Center
 */
public class Main {

  /** Application Major Version Number */
  static final int MAJOR_VERSION = 2;

  /** Application Minor Version Number */
  static final int MINOR_VERSION = 0;

  /** Default name of a new Ewon */
  static final String DEFAULT_EWON_NAME = "eWON";

  /** Filename of connector config file */
  static final String CONNECTOR_CONFIG_FILENAME = "/usr/ConnectorConfig.json";

  /** PI Server management object */
  static OSIsoftServer piServer;

  public static void main(String[] args) {

    // Start the webserver to accept json file
    RestFileServer restServer = new RestFileServer();
    restServer.start();

    // Indicate the version number and that the application is starting
    Logger.LOG_CRITICAL("OSIsoft Connector v" + MAJOR_VERSION + "." + MINOR_VERSION + " starting");
    OSIsoftConfig.initConfig(CONNECTOR_CONFIG_FILENAME);

    // Check that the flexy has a non-default name, stop the application if not
    if (OSIsoftConfig.getFlexyName().equals(DEFAULT_EWON_NAME)) {
      Logger.LOG_SERIOUS("Device name is set to \"eWON\" which is the default name");
      Logger.LOG_SERIOUS("This device's name must be changed from default");
      Logger.LOG_SERIOUS("Application aborting due to default name use");
      System.exit(0);
    }

    // Set the path to the directory holding the certificate for the server
    // Only needed if the certificate is self signed
    setCertificatePath(OSIsoftConfig.getCertificatePath());
    setHttpTimeouts();

    int res = OSIsoftServer.NO_ERROR;
    piServer = new OSIsoftServer();

    do {
      try {
        Logger.LOG_INFO("Initializing tags");
        res = piServer.initTags();
      } catch (JSONException e) {
        Logger.LOG_SERIOUS("Linking Ewon tags to OSIsoft PI server failed");
        Logger.LOG_EXCEPTION(e);
      }
    } while (res != OSIsoftServer.NO_ERROR);

    Logger.LOG_INFO("Finished initializing tags");

    DataPoster datathread = new DataPoster(piConfig.getCommunicationType());
    datathread.start();

  }

  /**
   * Sets the directory that the Ewon uses to check for SSL Certificates
   *
   * @param path directory path where certificate is stored
   */
  private static void setCertificatePath(String path) {

    SysControlBlock SCB;
    try {
      SCB = new SysControlBlock(SysControlBlock.SYS);
      if (!SCB.getItem("HttpCertDir").equals(path)) {
        SCB.setItem("HttpCertDir", path);
        SCB.saveBlock(true);
      }
    } catch (Exception e) {
      Logger.LOG_SERIOUS("Setting certificate directory failed");
      System.exit(0);
    }
  }

  /**
   * Sets the http timeouts Note: This changes the Ewon's global HTTP timeouts and stores these
   * values in NV memory.
   */
  private static void setHttpTimeouts() {
    SysControlBlock SCB;
    boolean needsSave = false;
    final String HTTPS_TIMEOUT_S = "2";
    try {
      SCB = new SysControlBlock(SysControlBlock.SYS);

      if (!SCB.getItem("HTTPC_SDTO").equals(HTTPS_TIMEOUT_S)) {
        SCB.setItem("HTTPC_SDTO", HTTPS_TIMEOUT_S);
        needsSave = true;
      }

      if (!SCB.getItem("HTTPC_RDTO").equals(HTTPS_TIMEOUT_S)) {
        SCB.setItem("HTTPC_RDTO", HTTPS_TIMEOUT_S);
        needsSave = true;
      }

      if (needsSave) {
        SCB.saveBlock(true);
      }

    } catch (Exception e) {
      Logger.LOG_SERIOUS("Setting timeouts failed. Application ending");
      System.exit(0);
    }
  }
}
