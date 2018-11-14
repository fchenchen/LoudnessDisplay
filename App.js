import React from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {Loudness} from 'react-native-loudness';
import { PermissionsAndroid } from 'react-native';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isPermissionGranted: false,
      isRecordStarted: false,
      loudness: -160, // Absolute silence by default
    }
    const loudness = new Loudness();

    const requestRecordAudioPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            'title': 'Record Audio Permission',
            'message': 'This App needs permission to record audio ' +
                       'so the loudness can be properly displayed.'
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can record audio")
          this.setState({isPermissionGranted: true});
        } else {
          console.log("Record audio permission denied")
        }
      } catch (err) {
        console.warn(err)
      }
    }

    requestRecordAudioPermission();

    this.onPressButton = () => {
      // No permission, do nothing
      if (!this.state.isPermissionGranted) return;

      if (!this.state.isRecordStarted){
        // Has permission and not started yet, start a getter
        loudness.start();
        this.setState({isRecordStarted: true,});
        this.loudnessGetter = setInterval(() => {
          loudness.getLoudness((loudness) => {
            // console.log(loudness);
            this.setState({loudness: loudness,});
          });
        }, 100);
      } else {
        // Stop and clear the getter
        loudness.stop();
        this.setState({isRecordStarted: false,});
        clearInterval(this.loudnessGetter);
      }
    }

    this.getButtonText = () => {
      if (!this.state.isPermissionGranted){
        return 'No Permission';
      }

      if (this.state.isRecordStarted) {
        return 'Stop';
      }

      return 'Start';
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loudness</Text>
        <Text style={styles.number}>{this.state.loudness.toFixed(2)}</Text>
        <TouchableOpacity onPress={this.onPressButton}>
          <View style={styles.button}>
            <Text style={styles.title}>{this.getButtonText()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  number: {
    fontSize: 20,
    textAlign: 'center',
    color: 'red',
  },
});
