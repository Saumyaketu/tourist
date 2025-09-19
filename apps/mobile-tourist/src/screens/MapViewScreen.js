import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapViewScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert("Permission Denied", "Please enable location services to view the map.");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  let mapContent;
  if (errorMsg) {
    mapContent = <Text style={styles.text}>{errorMsg}</Text>;
  } else if (location) {
    mapContent = (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
        />
      </MapView>
    );
  } else {
    mapContent = <ActivityIndicator size="large" color="#0000ff" />;
  }

  return <View style={styles.container}>{mapContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});

export default MapViewScreen;
