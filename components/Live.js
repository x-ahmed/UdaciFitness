import React, { Component } from "react"
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	Animated,
} from "react-native"
import { Foundation } from "@expo/vector-icons"
import * as Location from "expo-location"
import * as Permissions from "expo-permissions"
import { calculateDirection } from "../utils/helpers"
import { purple, white } from "../utils/colors"

class Live extends Component {
	state = {
		coords    : null,
		status    : null,
		direction : "",
		bounce    : new Animated.Value(1),
	}

	componentDidMount() {
		Permissions.getAsync(Permissions.LOCATION)
			.then(({ status }) => {
				if (status === "granted") {
					return this.setLocation()
				}
				this.setState(() => ({ status }))
			})
			.catch((error) => {
				console.log("error getting location permission:", error)
				this.setState(() => ({ status: "undetermined" }))
			})
	}

	askPermission = () => {
		Permissions.askAsync(Permissions.LOCATION)
			.then(({ status }) => {
				if (status === "granted") {
					return this.setLocation()
				}
				this.setState(() => ({ status }))
			})
			.catch((error) => {
				console.log("error asking location permission: ", error)
			})
	}
	setLocation = () => {
		Location.watchPositionAsync(
			{
				enableHighAccuracy : true,
				timeInterval       : 1,
				distanceInterval   : 1,
			},
			({ coords }) => {
				const newDirection = calculateDirection(coords.heading)
				const { direction, bounce } = this.state

				if (newDirection !== direction) {
					Animated.sequence([
						Animated.timing(bounce, {
							duration : 200,
							toValue  : 1.04,
						}),
						Animated.spring(bounce, { toValue: 1, friction: 4 }),
					]).start()
				}

				this.setState(() => ({
					coords,
					status    : "granted",
					direction : newDirection,
				}))
			},
		)
	}

	render() {
		const { coords, status, direction, bounce } = this.state
		let ui
		switch (status) {
			case null:
				ui = (
					<View style={styles.center}>
						<ActivityIndicator
							size="large"
							color={purple}
							style={{ marginTop: 30 }}
						/>
					</View>
				)
				break
			case "denied":
				ui = (
					<View style={styles.center}>
						<Foundation name="alert" size={50} />
						<Text>
							You denied location permissions, just fix this by
							visiting your settings location services for this
							app.
						</Text>
					</View>
				)
				break
			case "undetermined":
				ui = (
					<View style={styles.center}>
						<Foundation name="alert" size={50} />
						<Text>
							You need to enable location services for this app.
						</Text>
						<TouchableOpacity
							onPress={this.askPermission}
							style={styles.button}
						>
							<Text style={styles.buttonText}>Enable</Text>
						</TouchableOpacity>
					</View>
				)
				break

			default:
				ui = (
					<View style={styles.container}>
						<View style={styles.directionContainer}>
							<Text style={styles.header}>You're heading</Text>
							<Animated.Text
								style={[
									styles.direction,
									{ transform: [ { scale: bounce } ] },
								]}
							>
								{direction}
							</Animated.Text>
						</View>
						<View style={styles.metricContainer}>
							<View style={styles.metric}>
								<Text
									style={[ styles.header, { color: white } ]}
								>
									Altitude
								</Text>
								<Text
									style={[
										styles.subHeader,
										{ color: white },
									]}
								>
									{Math.round(coords.altitude * 3.2808)} Feet
								</Text>
							</View>
						</View>
						<View style={styles.metricContainer}>
							<View style={styles.metric}>
								<Text
									style={[ styles.header, { color: white } ]}
								>
									Speed
								</Text>
								<Text
									style={[
										styles.subHeader,
										{ color: white },
									]}
								>
									{(coords.speed * 2.2369).toFixed(1)} mph
								</Text>
							</View>
						</View>
					</View>
				)
				break
		}

		return ui
	}
}

const styles = StyleSheet.create({
	container          : {
		flex           : 1,
		justifyContent : "space-between",
	},
	center             : {
		flex           : 1,
		justifyContent : "center",
		alignItems     : "center",
		marginLeft     : 30,
		marginRight    : 30,
	},
	button             : {
		padding         : 10,
		backgroundColor : purple,
		alignSelf       : "center",
		borderRadius    : 5,
		margin          : 20,
	},
	buttonText         : {
		color    : white,
		fontSize : 20,
	},
	directionContainer : {
		flex           : 1,
		justifyContent : "center",
	},
	header             : {
		fontSize  : 35,
		textAlign : "center",
	},
	direction          : {
		color     : purple,
		fontSize  : 120,
		textAlign : "center",
	},
	metricContainer    : {
		flexDirection   : "row",
		justifyContent  : "space-around",
		backgroundColor : purple,
	},
	metric             : {
		flex            : 1,
		paddingTop      : 15,
		paddingBottom   : 15,
		backgroundColor : "rgba(225,225,225,0.1)",
		marginTop       : 20,
		marginBottom    : 20,
		marginLeft      : 10,
		marginRight     : 10,
	},
	subHeader          : {
		fontSize  : 25,
		textAlign : "center",
		marginTop : 5,
	},
})

export default Live
