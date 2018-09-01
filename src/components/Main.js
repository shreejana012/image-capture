import React, { Component } from "react";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { RNCamera } from "react-native-camera";

import InfoBar from "./common/InfoBar";
import Button from "./common/Button";
import strings from "./string";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: strings.status,
      cash: strings.cash,
      buttonString: strings.buttonString,
      backgroundColor: "#41D3BD",
      computing: false
    };

    this.onCaptureClick = this.onCaptureClick.bind(this);
    this.takePicture = this.takePicture.bind(this);
    this.sendToApi = this.sendToApi.bind(this);
  }

  componentWillMount() {
    console.disableYellowBox = true;
  }

  onCaptureClick() {
    if (!this.state.computing) {
      this.setState({
        status: strings.computing,
        cash: strings.computingLoading,
        backgroundColor: "#EFDC05",
        computing: !this.state.computing
      });

      this.takePicture();
    }
  }

  async takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      this.sendToApi(data);
    } else {
      this.setState({
        status: strings.error,
        cash: strings.wentWrong,
        backgroundColor: "#D81159",
        computing: !this.state.computing
      });
    }
  }

  sendToApi(image) {
    const apiUrl = "<<change here>>";

    let formData = new FormData();
    formData.append("file", {
      uri: image.uri,
      type: "image/jpg",
      name: "upload.jpg"
    });

    fetch(apiUrl, {
      method: "post",
      body: formData
    })
      .then(response => response.json())
      .then(resolve => {
        let cash = resolve.cash;
        this.setState({
          status: strings.detected,
          cash: cash,
          backgroundColor: "#41D3BD",
          computing: !this.state.computing
        });
      })
      .catch(error => {
        this.setState({
          status: strings.error,
          cash: strings.wentWrong,
          backgroundColor: "#D81159",
          computing: !this.state.computing
        });
      });
  }

  render() {
    const { container, camera, preview } = styles;

    const { status, cash, backgroundColor, buttonString } = this.state;

    return (
      <View style={container}>
        <InfoBar
          status={status}
          cash={cash}
          backgroundColor={backgroundColor}
        />
        <View style={camera}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            permissionDialogTitle={"Permission to use camera"}
            permissionDialogMessage={
              "We need your permission to use your camera phone"
            }
          >
            <View
              style={{
                flex: 0,
                flexDirection: "row",
                justifyContent: "center"
              }}
            >
              <TouchableWithoutFeedback>
                <Button onPress={this.onCaptureClick}>{buttonString}</Button>
              </TouchableWithoutFeedback>
            </View>
          </RNCamera>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 2
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  }
});
