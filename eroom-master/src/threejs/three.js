import React, { Component, } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AnimationMixer } from "three";

import { gsap } from "gsap";
//import { click } from "@testing-library/user-event/dist/click";

function getName(str) {
	const str_list = str.split('.');
	return str_list[0];	
}

class ThreeScene extends Component {
	canvasRef = React.createRef();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 0, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ antialias: true });
	loader = new GLTFLoader();
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	previousCameraPos = new THREE.Vector3(0, 3, 0);
	viewObjectFlag = false;

	componentDidMount() {
		// Canvas
		const canvas = this.canvasRef.current;
		if (canvas.height > 0) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(canvas.width, canvas.height);
			return;
		}
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Camera
		this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
		
		this.camera.updateProjectionMatrix();

		this.mixers = {};
		this.clipActions = {};this.camera.position.set(0, 3, 0);

		this.clock = new THREE.Clock();

		this.dict = {
			"LaptopAction": ["Base001"],
			"Tv Cabinet.001Action": ['Tv_Cabinet001'],
			"TvCabinetRight": ['Tv_Cabinet002'],
			"TvCabinetUp": ['Tv_Cabinet004'],
			"TvCabinetDown": ['Tv_Cabinet003'],
			"handle1Action": ["handle1"],
			"handle2Action": ["handle2"],
			"DuckUp": ["Bone"],
			"DuckUp.003": ["Bone_1"],
			"laptopcard": ["Cube005"],
			"CardWall": ["Cube006"],
			"Mat": ["Bone_2"],
			"KeyAction": ["Key"],
		}

		// Renderer
		this.renderer.setSize(canvas.width, canvas.height);
		canvas.appendChild(this.renderer.domElement);


		// Light
		// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		// directionalLight.position.set(5, 10, 7.5);
		// this.scene.add(directionalLight);
		// const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
		// directionalLight1.position.set(-5, 10, -7.5);
		// this.scene.add(directionalLight1);
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
		this.scene.add(ambientLight);
		const pointLight = new THREE.PointLight(0xffffff, 0.5);
		pointLight.position.set(0, 3.3, 0);
		this.scene.add(pointLight);
		// const hemisphereLight = new THREE.HemisphereLight(0xdddddd, 0x666666);
		// this.scene.add(hemisphereLight);

		/**
		 * Objects
		 */
		// Axes
		// const axes = new THREE.AxesHelper(10);
		// this.scene.add(axes);

		// Room
		this.loader.load("FinalScene3.gltf", (gltf) => {
			const model = gltf.scene;
			const animations = gltf.animations;

			

			animations.map(animation=>{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName(getName(animation.tracks[0].name)));
				const clip = new THREE.AnimationClip(animation.name, 1, animation.tracks);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers[animation.name] = mixer;
				this.clipActions[animation.name] = clipAction;
				this.camera.position.set(0, 3, 0);
			})

			this.scene.add(model);
		});

		// camera bound cylinder
		const geometry = new THREE.CylinderGeometry();
		const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
		const cameraBoundCylinder = new THREE.Mesh(geometry, material);
		cameraBoundCylinder.position.set(0, 2.6, 0);
		cameraBoundCylinder.scale.set(5, 5, 5);
		cameraBoundCylinder.visible = false;
		this.scene.add(cameraBoundCylinder);

		// Controls
		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls.target.set(0, 3, 0);
		this.orbitControls.update();
		this.orbitControls.maxPolarAngle = Math.PI * 0.50;
		//  this.pointerlockControls = new PointerLockControls(
		// this.camera,
		//this.renderer.domElement
		// );

		const animate = () => {
			const delta = this.clock.getDelta();
			
			requestAnimationFrame(animate);
			

			for (const [_,mixer] of Object.entries(this.mixers)) {
				mixer.update(delta);
			}

			// const intersects = this.raycaster.intersectObjects(
			//   this.scene.children,
			//   true
			// );

			// if (intersects.length > 0) {
			//   intersects[0].object.material.color.set(0xff0000);
			//   // console.log(intersects[0].object);
			// }

			//zoomin


			this.renderer.render(this.scene, this.camera);
		};
		animate();

		const checkParentName = (obj, name) => {
			let tmp = obj;
			let flag = false;
			while (1) {
				if (tmp.name === name) {
					flag = true;
					break;
				}
				tmp = tmp.parent;
				if (tmp === null) break;
			}

			return [flag, tmp];
		}

		const moveforward = (delta) => {
			this.camera.position.set(
				this.camera.position.x + this.raycaster.ray.direction.x * delta,
				this.camera.position.y + this.raycaster.ray.direction.y * delta,
				this.camera.position.z + this.raycaster.ray.direction.z * delta,
			)
		}

		//popup

		window.addEventListener("dbclick", (event) => {
			console.log("dbclick")
		})


		// Create a new DOM element for the popup
		window.addEventListener("click", (event) => {
			//########
			// var popup = document.createElement('div');
			// popup.style.position = 'absolute';
			// popup.style.width = '200px';
			// popup.style.height = '100px';
			// popup.style.backgroundColor = 'white';
			// popup.style.border = '1px solid black';
			// popup.style.padding = '10px';
			// popup.innerText = 'popup';
			//################

			// Get the position of the 3D object in the viewport
			// var position = new THREE.Vector3();
			// position.setFromMatrixPosition(cube.matrixWorld);
			// position.project(this.camera);

			// Convert the position to CSS coordinates
			// var widthHalf = 0.5 * this.renderer.getContext().canvas.width;
			// var heightHalf = 0.5 * this.renderer.getContext().canvas.height;
			// position.x = (position.x * widthHalf) + widthHalf;
			// position.y = -(position.y * heightHalf) + heightHalf;

			this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			this.raycaster.setFromCamera(this.mouse, this.camera);

			const intersects = this.raycaster.intersectObjects(this.scene.children);
			if (intersects.length > 0) {
				for (const [key, names] of Object.entries(this.dict)) {
					for (const name of names) {
						const [flag, obj] = checkParentName(intersects[0].object, name);
						if (flag) {
							const pos = new THREE.Vector3();
							obj.getWorldPosition(pos);
							// this.orbitControls.target = new THREE.Vector3(0, 0, 0);

							pos.add(this.camera.position.clone().sub(pos).normalize().multiplyScalar(2));
							// this.clipActions[key].play();
							// this.viewObjectFlag = true;
							// this.orbitControls.enabled = false;

							this.clipActions[key].play();

							// gsap.to(this.camera.position, {
							// 	duration: 3, x: pos.x, y: pos.y, z: pos.z, onUpdate: () => {
							// 		// this.orbitControls.target.copy(this.camera.position)
							// 		// this.orbitControls.update();
							// 		// this.camera.lookAt(tmp)
							// 	}, onComplete: () => {
							// 		// this.orbitControls.target.copy(pos);
							// 		this.clipActions[key].play();
							// 		this.orbitControls.enabled = true;
							// 		this.orbitControls.update();
							// 		this.viewObjectFlag = false;
							// 	}
							// });
							//
							// this.orbitControls.target.add(pos.clone().sub(this.camera.position));
							// console.log(this.orbitControls.object)
							// this.orbitControls.object.rotateOnAxis(new THREE.Vector3(0, 1, 0),Math.PI / 6)

							// console.log(key)
						}
					}
				}
			}

			// Set the position of the popup
			//#############
			// popup.style.left = position.x + 'px';
			// popup.style.top = position.y + 'px';
			//###################

			//#############
			// let closeButton = popup.document.createElement("button");
			// closeButton.innerHTML = "Close Popup";
			// closeButton.addEventListener("click", function () {
			//   popup.close();
			// });
			//##################

			// Add the popup to the document body
			// document.body.appendChild(popup);
			// document.body.appendChild(closeButton);//##
		})

		window.addEventListener("resize", () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(canvas.width, canvas.height);
		});

		// canvas.addEventListener("click", () => {
		//  this.pointerlockControls.lock();
		// });

		canvas.addEventListener("wheel", (event) => {
			if (!this.viewObjectFlag) {
				// Get the camera's position as a vector
				const cameraPosition = new THREE.Vector3();
				this.camera.getWorldPosition(cameraPosition);

				// Get the bounding box of the object
				const boundingBox = new THREE.Box3().setFromObject(cameraBoundCylinder);

				// Check if the camera position is inside the bounding box
				if (boundingBox.containsPoint(cameraPosition)) {
					// Collision detected between the camera and the object
					this.camera.getWorldPosition(this.previousCameraPos);
					this.orbitControls.enabled = true;
					const delta = - event.deltaY * 0.001; // forward: -100, backward: +100
					// console.log(this.camera.position);
					// this.camera.position.add(this.raycaster.ray.direction.clone());
					moveforward(delta);

					// console.log(delta);
				} else {
					this.orbitControls.enabled = false;
					// console.log(this.previousCameraPos);
					gsap.to(this.camera.position, {
						duration: 0, x: this.previousCameraPos.x, y: this.previousCameraPos.y, z: this.previousCameraPos.z, onComplete: () => {
							this.orbitControls.enabled = true;
						}
					});
					
					this.orbitControls.target.add(this.previousCameraPos.clone().sub(this.camera.position));
				}
			}
			
		});

		canvas.addEventListener("mousemove", (event) => {
			if (!this.viewObjectFlag) {
				// Get the camera's position as a vector
				const cameraPosition = new THREE.Vector3();
				this.camera.getWorldPosition(cameraPosition);

				// Get the bounding box of the object
				const boundingBox = new THREE.Box3().setFromObject(cameraBoundCylinder);

				// Check if the camera position is inside the bounding box
				if (boundingBox.containsPoint(cameraPosition) && !this.viewObjectFlag) {
					// Collision detected between the camera and the object
					this.camera.getWorldPosition(this.previousCameraPos);
					this.orbitControls.enabled = true;
					// console.log(this.raycaster.ray.direction);
					this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
					this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
					this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

					// const intersects = this.raycaster.intersectObjects(this.scene.children);
					// if (intersects.length > 0) {
					// 	console.log(intersects);
					// }

				} else {
					this.orbitControls.enabled = false;
					// console.log(this.previousCameraPos);
					this.orbitControls.enabled = false;
					gsap.to(this.camera.position, {
						duration: 0, x: this.previousCameraPos.x, y: this.previousCameraPos.y, z: this.previousCameraPos.z, onComplete: () => {
							this.orbitControls.enabled = true;
						}
					});
					
					this.orbitControls.target.add(this.previousCameraPos.clone().sub(this.camera.position));
				}
				// this.mouse.set(0, 0);
				// console.log(this.mouse);
			}
		});

	}

	render() {
		return <div ref={this.canvasRef} />;
	}
}

export default ThreeScene;