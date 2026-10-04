import { GDScriptDoc } from '../types';

export const GODOT_NODE_HIERARCHIES = {
  MainLevel: [
    'MainLevel (Node2D)  [Script: main_level.gd]',
    '├── WorldEnvironment (WorldEnvironment)  [Environment resource attached]',
    '├── DirectionalLight2D (DirectionalLight2D)  [Subtle dim ambient #0a1128]',
    '├── TileMapLayer / LevelGeometry (TileMapLayer or StaticBody2D walls)',
    '│   └── CollisionPolygon2D / CollisionShape2D',
    '├── PatrolWaypoints (Node2D)',
    '│   ├── Waypoint1 (Marker2D)',
    '│   ├── Waypoint2 (Marker2D)',
    '│   └── Waypoint3 (Marker2D)',
    '├── Possessables (Node2D)',
    '│   ├── PossessableVase (RigidBody2D) -> Group: "Possessable"',
    '│   ├── PossessableCrate (RigidBody2D) -> Group: "Possessable"',
    '│   └── PossessableStatue (RigidBody2D) -> Group: "Possessable"',
    '├── GuardNPC (CharacterBody2D)  [Script: guard_ai.gd]',
    '│   ├── CollisionShape2D (CapsuleShape2D or CircleShape2D)',
    '│   ├── Sprite2D (Sprite2D / AnimatedSprite2D)',
    '│   ├── FlashlightCone (PointLight2D)  [Shadows enabled, yellow light]',
    '│   ├── VisionCone (Area2D)  [Script / CollisionPolygon2D arc]',
    '│   │   └── CollisionPolygon2D (Convex vision triangle/arc)',
    '│   ├── NavigationAgent2D (NavigationAgent2D)  [Optional for advanced pathing]',
    '│   ├── SuspiciousTimer (Timer)  [Wait Time: 3.0, One Shot: true]',
    '│   ├── StunTimer (Timer)  [Wait Time: 5.0, One Shot: true]',
    '│   └── AlertIcon (Sprite2D or Label)  [Shows "?" or "!"]',
    '├── GhostPlayer (CharacterBody2D)  [Script: ghost_player.gd]',
    '│   ├── CollisionShape2D (CircleShape2D)  [Layer 2, Mask 1]',
    '│   ├── Sprite2D (Sprite2D)  [Modulate: neon cyan #00f3ff, HDR raw energy]',
    '│   ├── GPUParticles2D (GPUParticles2D)  [Ethereal trailing smoke]',
    '│   ├── RayCast2D / SelectionArea (Area2D or RayCast2D for mouse hover)',
    '│   └── Camera2D (Camera2D)  [Current: true, Position Smoothing enabled]',
    '└── UI (CanvasLayer)  [Script: panic_meter.gd, Layer: 100]',
        '    └── PanicControl (Control)  [Anchors: Top Wide]',
        '        ├── PanicVBox (VBoxContainer)',
        '        │   ├── HeaderLabel (Label) ["PANIC LEVEL"]',
        '        │   └── PanicProgressBar (ProgressBar)  [Range: 0 to 100, Step: 1]',
        '        ├── RedTintVignette (ColorRect)  [Visible: false, Color: #ff003344]',
        '        └── LockdownBanner (PanelContainer)  [Visible: false]',
        '            └── LockdownLabel (Label) ["LOCKDOWN - EXORCISED"]'
  ],

  GhostPlayer: [
    'GhostPlayer (CharacterBody2D)  [Script: res://scripts/ghost_player.gd]',
    '├── CollisionShape2D (CircleShape2D)  [Collision Layer: 2 (Ghost), Mask: 1 (World Walls)]',
    '├── Sprite2D (Sprite2D)  [Modulate: Color(0.0, 3.0, 3.5, 0.85) -> Glow enabled]',
    '├── GPUParticles2D (GPUParticles2D)  [Cyan ghost trail particles]',
    '├── HoverDetector (Area2D)  [Radius ~80px for proximity selection]',
    '│   └── CollisionShape2D (CircleShape2D)',
    '└── Camera2D (Camera2D)  [position_smoothing_enabled = true, smoothing_speed = 6.0]'
  ],

  PossessableObject: [
    'PossessableObject (RigidBody2D)  [Script: res://scripts/possessable_object.gd]',
    '  * Node in Group: "Possessable"',
    '  * Collision Layer: 4 (Objects)',
    '  * Collision Mask: 1 (Walls) + 4 (Objects) + 8 (Guards)',
    '  * Contact Monitor: ON, Max Contacts Reported: 8',
    '├── CollisionShape2D (RectangleShape2D or CircleShape2D)',
    '├── Sprite2D (Sprite2D)  [Normal modulate, highlights cyan when possessed]',
    '├── GlowParticles (GPUParticles2D)  [Emits when possessed]',
    '├── AudioStreamPlayer2D (AudioStreamPlayer2D)  [For impact and launch sounds]',
    '└── SelectionOutline (Line2D / Shader)  [Visual feedback when cursor hovers]'
  ],

  GuardNPC: [
    'GuardNPC (CharacterBody2D)  [Script: res://scripts/guard_ai.gd]',
    '  * Collision Layer: 8 (NPC)',
    '  * Collision Mask: 1 (Walls) + 4 (Objects)',
    '├── CollisionShape2D (CapsuleShape2D)',
    '├── BodySprite (Sprite2D)',
    '├── FlashlightLight (PointLight2D)  [Texture: 2D Cone gradient, Color: #fff3a0, Shadows: ON]',
    '├── VisionCone (Area2D)  [Monitors RigidBody2D objects]',
    '│   └── CollisionPolygon2D (Arc polygon: 0,0 to +250,-100 and +250,+100)',
    '├── SuspiciousTimer (Timer)  [3.0 seconds, one_shot = true]',
    '├── StunTimer (Timer)  [5.0 seconds, one_shot = true]',
    '├── StateLabel (Label)  [Shows "?", "!", or "ZZZ"]',
    '└── PatrolTimer (Timer)  [Wait time between waypoints]'
  ],

  PanicMeterUI: [
    'UI (CanvasLayer)  [Script: res://scripts/panic_meter.gd, process_mode: ALWAYS (NodeProcessMode.PROCESS_MODE_ALWAYS)]',
    '└── Control (Control)  [Layout: Full Rect]',
    '    ├── MarginContainer (MarginContainer)  [Top-right anchor, margins: 24px]',
    '    │   └── VBoxContainer (VBoxContainer)',
    '    │       ├── Label (Label) ["SECURITY PANIC METER"]',
    '    │       └── ProgressBar (ProgressBar)  [Min: 0, Max: 100, Step: 1]',
    '    ├── RedAlertOverlay (ColorRect)  [Full Rect, Color: Color(0.8, 0.05, 0.05, 0.35), Visible: false]',
    '    └── LockdownPanel (CenterContainer)  [Full Rect, Visible: false]',
    '        └── PanelContainer (PanelContainer)',
    '            └── VBoxContainer',
    '                ├── LockdownTitle (Label) ["LOCKDOWN - EXORCISED"]',
    '                └── RestartHint (Label) ["Press R to restart infiltration"]'
  ]
};

export const GODOT_SCRIPTS: GDScriptDoc[] = [
  {
    id: 'ghost_player',
    filename: 'ghost_player.gd',
    title: 'Ghost Player Controller',
    nodeType: 'CharacterBody2D',
    description: 'Handles free floating Ghost movement (WASD), mouse hover detection for possessables, smooth camera transition, and input handoff.',
    nodeTree: GODOT_NODE_HIERARCHIES.GhostPlayer,
    setupNotes: [
      'Attach this script to the GhostPlayer (CharacterBody2D) scene root.',
      'Ensure the Camera2D has position_smoothing_enabled = true for cinematic possession zoom.',
      'Add target objects to the "Possessable" group in Node > Groups tab in Godot editor.',
      'Collision Layer: Layer 2 (Ghost). Collision Mask: Layer 1 (World walls only, ghosts fly through objects).'
    ],
    code: `extends CharacterBody2D
class_name GhostPlayer

## Free floating ghost speed in pixels/sec
@export var float_speed: float = 280.0
## Acceleration & damping for ethereal floating inertia
@export var float_acceleration: float = 1400.0
@export var float_friction: float = 1200.0
## Maximum distance from cursor to interact with possessable objects
@export var possession_reach: float = 180.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var camera: Camera2D = $Camera2D
@onready var particles: GPUParticles2D = $GPUParticles2D

var current_possessed_object: RigidBody2D = null
var is_possessing: bool = false
var hovered_object: RigidBody2D = null

func _ready() -> void:
	# Keep ghost player processing even if paused for custom cinematic menus
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# Set initial camera as current active camera
	if camera:
		camera.make_current()

func _unhandled_input(event: InputEvent) -> void:
	# Click to possess target object under mouse or close to ghost
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		if not is_possessing:
			_try_possess_hovered_or_clicked()
	# Right-click or 'Q' to unpossess and manifest ghost again
	elif event.is_action_pressed("ui_cancel") or (event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT and event.pressed):
		if is_possessing:
			release_possession()

func _physics_process(delta: float) -> void:
	if is_possessing:
		# When possessing, ghost stays hidden inside the object
		if is_instance_valid(current_possessed_object):
			global_position = current_possessed_object.global_position
		else:
			release_possession()
		return

	# Normal Ghost Movement: WASD / Arrow Keys
	var input_vector := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if input_vector != Vector2.ZERO:
		velocity = velocity.move_toward(input_vector * float_speed, float_acceleration * delta)
		# Subtle bobbing and rotation toward movement
		rotation = lerp_angle(rotation, input_vector.x * 0.15, delta * 6.0)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, float_friction * delta)
		rotation = lerp_angle(rotation, 0.0, delta * 6.0)

	move_and_slide()
	_update_hovered_possessable()

func _update_hovered_possessable() -> void:
	var mouse_pos := get_global_mouse_position()
	var space_state := get_world_2d().direct_space_state
	
	# Raycast / Point query at mouse position
	var point_query := PhysicsPointQueryParameters2D.new()
	point_query.position = mouse_pos
	point_query.collide_with_bodies = true
	point_query.collide_with_areas = false
	point_query.collision_mask = 4 # Layer 3 / Possessables
	
	var results := space_state.intersect_point(point_query, 4)
	var found_possessable: RigidBody2D = null
	
	for hit in results:
		var collider = hit.collider
		if collider is RigidBody2D and collider.is_in_group("Possessable"):
			if global_position.distance_to(collider.global_position) <= possession_reach:
				found_possessable = collider
				break

	if hovered_object != found_possessable:
		if is_instance_valid(hovered_object) and hovered_object.has_method("set_highlight"):
			hovered_object.set_highlight(false)
		hovered_object = found_possessable
		if is_instance_valid(hovered_object) and hovered_object.has_method("set_highlight"):
			hovered_object.set_highlight(true)

func _try_possess_hovered_or_clicked() -> void:
	if is_instance_valid(hovered_object):
		possess_object(hovered_object)
		return

	# Fallback: scan closest object within possession_reach
	var possessables := get_tree().get_nodes_in_group("Possessable")
	var closest_obj: RigidBody2D = null
	var min_dist: float = possession_reach

	for obj in possessables:
		if obj is RigidBody2D:
			var d := global_position.distance_to(obj.global_position)
			if d < min_dist:
				min_dist = d
				closest_obj = obj

	if closest_obj:
		possess_object(closest_obj)

func possess_object(target: RigidBody2D) -> void:
	if not is_instance_valid(target) or not target.has_method("on_possessed"):
		return

	is_possessing = true
	current_possessed_object = target
	
	# Hide ghost sprite & particles
	sprite.visible = false
	if particles:
		particles.emitting = false
	$CollisionShape2D.disabled = true

	# Notify possessable object
	target.on_possessed(self)

	# Smooth Camera Transition: reparent or repoint Camera2D
	if camera:
		camera.reparent(target)
		camera.position = Vector2.ZERO

func release_possession() -> void:
	if not is_possessing:
		return

	if is_instance_valid(current_possessed_object) and current_possessed_object.has_method("on_unpossessed"):
		current_possessed_object.on_unpossessed()

	# Reparent camera back to Ghost
	if camera and is_instance_valid(camera.get_parent()):
		camera.reparent(self)
		camera.position = Vector2.ZERO

	# Manifest Ghost adjacent to object
	if is_instance_valid(current_possessed_object):
		global_position = current_possessed_object.global_position + Vector2(0, -20)
	
	sprite.visible = true
	if particles:
		particles.emitting = true
	$CollisionShape2D.disabled = false
	
	is_possessing = false
	current_possessed_object = null
`
  },

  {
    id: 'possessable_object',
    filename: 'possessable_object.gd',
    title: 'Possessable Physics Object',
    nodeType: 'RigidBody2D',
    description: 'Implements apply_central_force driven by WASD when possessed, SPACE momentum launch (apply_central_impulse), speed streak visuals, and high-velocity guard impact.',
    nodeTree: GODOT_NODE_HIERARCHIES.PossessableObject,
    setupNotes: [
      'Attach to any RigidBody2D you want the ghost to possess (Vase, Crate, Suit of Armor, etc.).',
      'Remember to add the node to group "Possessable" via the Inspector or script.',
      'Enable "Contact Monitor" = ON and "Max Contacts Reported" >= 4 on the RigidBody2D inspector to detect collisions with Guards.'
    ],
    code: `extends RigidBody2D
class_name PossessableObject

## Sustained force applied while holding WASD keys
@export var push_force: float = 1400.0
## Heavy burst impulse applied when pressing SPACE (Momentum Launch)
@export var launch_impulse: float = 950.0
## Threshold at which moving object raises guard suspicion
@export var suspicious_velocity_threshold: float = 240.0
## Threshold at which colliding with guard causes a knockout / stun
@export var stun_velocity_threshold: float = 450.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var glow_particles: GPUParticles2D = get_node_or_null("GlowParticles")

var is_possessed: bool = false
var ghost_ref: GhostPlayer = null
var original_modulate: Color = Color.WHITE
# Neon Cyan HDR glow modulate (#00f3ff with HDR multiplier > 1.0)
var possessed_glow_color: Color = Color(0.0, 3.5, 4.0, 1.0)

func _ready() -> void:
	add_to_group("Possessable")
	# Enable contact monitoring for impact resolution
	contact_monitor = true
	max_contacts_reported = 8
	body_entered.connect(_on_body_entered)
	
	if sprite:
		original_modulate = sprite.modulate

func _integrate_forces(state: PhysicsDirectBodyState2D) -> void:
	if not is_possessed:
		return

	# WASD Driving Force
	var move_input := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if move_input != Vector2.ZERO:
		apply_central_force(move_input * push_force)

	# MOMENTUM LAUNCH: Pressing SPACE heavily launches the object
	if Input.is_action_just_pressed("ui_select"): # Spacebar
		var launch_direction := move_input
		if launch_direction == Vector2.ZERO and linear_velocity.length() > 20.0:
			# Use current trajectory if no key is actively pressed
			launch_direction = linear_velocity.normalized()
		elif launch_direction == Vector2.ZERO:
			# Fallback: launch forward towards mouse pointer
			launch_direction = (get_global_mouse_position() - global_position).normalized()
		
		apply_central_impulse(launch_direction * launch_impulse)
		_trigger_launch_feedback()

func on_possessed(player: GhostPlayer) -> void:
	is_possessed = true
	ghost_ref = player
	if sprite:
		# Bright ethereal cyan glow
		sprite.modulate = possessed_glow_color
	if glow_particles:
		glow_particles.emitting = true

func on_unpossessed() -> void:
	is_possessed = false
	ghost_ref = null
	if sprite:
		sprite.modulate = original_modulate
	if glow_particles:
		glow_particles.emitting = false

func set_highlight(active: bool) -> void:
	if is_possessed:
		return
	if sprite:
		sprite.modulate = Color(0.5, 1.5, 1.8, 1.0) if active else original_modulate

func _trigger_launch_feedback() -> void:
	# Visual/Auditory juice: camera shake and particle burst
	if ghost_ref and ghost_ref.camera:
		var tween := create_tween()
		tween.tween_property(ghost_ref.camera, "offset", Vector2(randf_range(-4, 4), randf_range(-4, 4)), 0.05)
		tween.tween_property(ghost_ref.camera, "offset", Vector2.ZERO, 0.1)

func _on_body_entered(body: Node) -> void:
	var impact_speed := linear_velocity.length()
	# Check if this high-speed object collided with a Guard
	if body.is_in_group("Guard") or body.has_method("take_physical_impact"):
		if impact_speed >= stun_velocity_threshold:
			body.take_physical_impact(self, impact_speed)
`
  },

  {
    id: 'guard_ai',
    filename: 'guard_ai.gd',
    title: 'Guard AI & Vision Cone System',
    nodeType: 'CharacterBody2D',
    description: 'Implements Finite State Machine (PATROL, SUSPICIOUS, STUNNED), waypoint traversal, Area2D flashlight vision cone detecting fast objects, and knockout reactions.',
    nodeTree: GODOT_NODE_HIERARCHIES.GuardNPC,
    setupNotes: [
      'Attach this script to GuardNPC (CharacterBody2D). Add GuardNPC to group "Guard".',
      'Create an Area2D child called "VisionCone" with a CollisionPolygon2D shaping the flashlight arc.',
      'Connect Area2D body_entered signal to _on_vision_cone_body_entered.',
      'Assign Marker2D patrol nodes to the "patrol_points" exported array in the Inspector.'
    ],
    code: `extends CharacterBody2D
class_name GuardAI

enum State { PATROL, SUSPICIOUS, STUNNED }

## Array of Marker2D nodes in the level representing patrol stops
@export var patrol_points: Array[NodePath] = []
@export var walk_speed: float = 75.0
@export var run_speed: float = 130.0
@export var vision_velocity_trigger: float = 240.0
@export var waypoint_arrival_distance: float = 20.0

@onready var vision_cone: Area2D = $VisionCone
@onready var flashlight: PointLight2D = $FlashlightLight
@onready var suspicious_timer: Timer = $SuspiciousTimer
@onready var stun_timer: Timer = $StunTimer
@onready var state_label: Label = $StateLabel
@onready var sprite: Sprite2D = $BodySprite

var current_state: State = State.PATROL
var current_waypoint_index: int = 0
var resolved_patrol_positions: Array[Vector2] = []
var suspicious_target_position: Vector2 = Vector2.ZERO

func _ready() -> void:
	add_to_group("Guard")
	_resolve_patrol_markers()
	
	# Connect Area2D detection
	if vision_cone:
		vision_cone.body_entered.connect(_on_vision_cone_body_entered)
	
	# Connect state timers
	if suspicious_timer:
		suspicious_timer.timeout.connect(_on_suspicious_timeout)
	if stun_timer:
		stun_timer.timeout.connect(_on_stun_timeout)

	_update_state_display()

func _physics_process(delta: float) -> void:
	match current_state:
		State.PATROL:
			_process_patrol(delta)
		State.SUSPICIOUS:
			_process_suspicious(delta)
		State.STUNNED:
			velocity = Vector2.ZERO
			move_and_slide()

	# Also scan continuous bodies in vision cone for fast moving possessables
	if current_state != State.STUNNED and vision_cone:
		for body in vision_cone.get_overlapping_bodies():
			_check_detected_body(body)

func _process_patrol(delta: float) -> void:
	if resolved_patrol_positions.is_empty():
		return

	var target := resolved_patrol_positions[current_waypoint_index]
	var dir := (target - global_position).normalized()
	velocity = dir * walk_speed
	
	# Face movement direction
	if velocity.length() > 5.0:
		rotation = lerp_angle(rotation, velocity.angle(), delta * 5.0)

	move_and_slide()

	if global_position.distance_to(target) <= waypoint_arrival_distance:
		current_waypoint_index = (current_waypoint_index + 1) % resolved_patrol_positions.size()

func _process_suspicious(delta: float) -> void:
	# Turn directly toward the suspicious point
	if suspicious_target_position != Vector2.ZERO:
		var target_angle := (suspicious_target_position - global_position).angle()
		rotation = lerp_angle(rotation, target_angle, delta * 8.0)
	
	velocity = Vector2.ZERO
	move_and_slide()

func _check_detected_body(body: Node) -> void:
	if current_state == State.STUNNED:
		return

	if body is RigidBody2D and body.is_in_group("Possessable"):
		# If the object is flying fast in the vision cone!
		if body.linear_velocity.length() >= vision_velocity_trigger:
			enter_suspicious_state(body.global_position)

func _on_vision_cone_body_entered(body: Node2D) -> void:
	_check_detected_body(body)

func enter_suspicious_state(disturbing_pos: Vector2) -> void:
	if current_state == State.STUNNED:
		return # Cannot be suspicious while unconscious

	current_state = State.SUSPICIOUS
	suspicious_target_position = disturbing_pos
	
	# Alert GameManager: increase panic meter by 20%
	if GameManager:
		GameManager.register_suspicious_event(self)

	# Stay in Suspicious state for 3.0 seconds as specified
	if suspicious_timer:
		suspicious_timer.start(3.0)
	
	_update_state_display()

func take_physical_impact(source_object: Node, impact_velocity: float) -> void:
	# Knockout / Stunned by high velocity possessed object
	current_state = State.STUNNED
	velocity = Vector2.ZERO
	
	# Stunned for 5.0 seconds as specified
	if stun_timer:
		stun_timer.start(5.0)
	if suspicious_timer:
		suspicious_timer.stop()
		
	# Dim flashlight when knocked down
	if flashlight:
		flashlight.energy = 0.2

	_update_state_display()

func _on_suspicious_timeout() -> void:
	if current_state == State.SUSPICIOUS:
		current_state = State.PATROL
		_update_state_display()

func _on_stun_timeout() -> void:
	if current_state == State.STUNNED:
		current_state = State.PATROL
		if flashlight:
			flashlight.energy = 1.0
		_update_state_display()

func _update_state_display() -> void:
	if not state_label:
		return
	match current_state:
		State.PATROL:
			state_label.text = ""
			modulate = Color.WHITE
		State.SUSPICIOUS:
			state_label.text = "!? SUSPICIOUS"
			modulate = Color(1.0, 0.9, 0.3)
		State.STUNNED:
			state_label.text = "★ STUNNED ★"
			modulate = Color(0.6, 0.6, 0.7)

func _resolve_patrol_markers() -> void:
	resolved_patrol_positions.clear()
	for np in patrol_points:
		var node = get_node_or_null(np)
		if node is Node2D:
			resolved_patrol_positions.append(node.global_position)
	if resolved_patrol_positions.is_empty():
		# Default fallback patrol path around starting position
		resolved_patrol_positions = [
			global_position + Vector2(150, 0),
			global_position + Vector2(150, 150),
			global_position + Vector2(-150, 150),
			global_position + Vector2(-150, 0)
		]
`
  },

  {
    id: 'game_manager',
    filename: 'game_manager.gd',
    title: 'GameManager (Autoload Singleton)',
    nodeType: 'Node (Autoload)',
    description: 'Central game manager tracking the 0-100% Panic Meter. Increases by 20% on detection, triggers physics freeze and lockdown at 100%.',
    nodeTree: ['Project Settings > Autoload', '  Path: res://scripts/game_manager.gd', '  Node Name: GameManager', '  Process Mode: Always'],
    setupNotes: [
      'In Godot, go to Project > Project Settings > Autoload.',
      'Add res://scripts/game_manager.gd with Node Name "GameManager".',
      'Ensure process_mode = Node.PROCESS_MODE_ALWAYS so menus can still respond when get_tree().paused is active.'
    ],
    code: `extends Node
## Autoload Singleton: GameManager
## Configured in Project Settings -> Autoload -> GameManager

signal panic_changed(current_panic: float, max_panic: float)
signal lockdown_triggered

@export var max_panic: float = 100.0
@export var panic_increase_per_detection: float = 20.0

var current_panic: float = 0.0
var is_lockdown_active: bool = false

func _ready() -> void:
	# GameManager continues executing even when game is paused!
	process_mode = Node.PROCESS_MODE_ALWAYS
	reset_game()

func reset_game() -> void:
	current_panic = 0.0
	is_lockdown_active = false
	get_tree().paused = false
	panic_changed.emit(current_panic, max_panic)

func register_suspicious_event(_guard_source: Node) -> void:
	if is_lockdown_active:
		return

	add_panic(panic_increase_per_detection)

func add_panic(amount: float) -> void:
	if is_lockdown_active:
		return

	current_panic = clamp(current_panic + amount, 0.0, max_panic)
	panic_changed.emit(current_panic, max_panic)

	# LOCKDOWN TRIGGER: 100% Panic reached
	if current_panic >= max_panic and not is_lockdown_active:
		trigger_lockdown()

func trigger_lockdown() -> void:
	is_lockdown_active = true
	# Freeze the physics engine and game simulation
	get_tree().paused = true
	lockdown_triggered.emit()
	print("[Polterheist] LOCKDOWN - EXORCISED! Physics paused.")

func _input(event: InputEvent) -> void:
	# Quick reload after lockdown by pressing R
	if is_lockdown_active and event.is_action_pressed("ui_reload", false):
		restart_level()

func restart_level() -> void:
	reset_game()
	get_tree().reload_current_scene()
`
  },

  {
    id: 'panic_meter_ui',
    filename: 'panic_meter.gd',
    title: 'Panic Meter UI & Lockdown HUD',
    nodeType: 'CanvasLayer',
    description: 'Smoothly animates the ProgressBar on CanvasLayer, flashes alert banners, and handles the full-screen red tint and "LOCKDOWN - EXORCISED" screen.',
    nodeTree: GODOT_NODE_HIERARCHIES.PanicMeterUI,
    setupNotes: [
      'Attach to the root UI (CanvasLayer) node.',
      'Set Process Mode to Node.PROCESS_MODE_ALWAYS so UI animations and restart buttons function during get_tree().paused.',
      'Assign child nodes to the exported node paths or keep matching node names.'
    ],
    code: `extends CanvasLayer
class_name PanicMeterUI

@onready var progress_bar: ProgressBar = $Control/MarginContainer/VBoxContainer/ProgressBar
@onready var red_tint_overlay: ColorRect = $Control/RedAlertOverlay
@onready var lockdown_panel: Control = $Control/LockdownPanel
@onready var restart_hint: Label = $Control/LockdownPanel/PanelContainer/VBoxContainer/RestartHint

var tween_bar: Tween

func _ready() -> void:
	# CanvasLayer UI must run even when the game physics is paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Initial visibility
	if red_tint_overlay:
		red_tint_overlay.visible = false
	if lockdown_panel:
		lockdown_panel.visible = false

	# Connect to Autoload GameManager signals
	if GameManager:
		GameManager.panic_changed.connect(_on_panic_changed)
		GameManager.lockdown_triggered.connect(_on_lockdown_triggered)
		_on_panic_changed(GameManager.current_panic, GameManager.max_panic)

func _on_panic_changed(current: float, maximum: float) -> void:
	if not progress_bar:
		return

	# Smooth tween of the progress bar value
	if tween_bar and tween_bar.is_valid():
		tween_bar.kill()
	
	tween_bar = create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween_bar.tween_property(progress_bar, "value", (current / maximum) * 100.0, 0.35)

	# Dynamic color coding: green -> yellow -> flashing red
	var ratio := current / maximum
	if ratio < 0.4:
		progress_bar.modulate = Color(0.2, 0.9, 0.4)
	elif ratio < 0.8:
		progress_bar.modulate = Color(1.0, 0.85, 0.2)
	else:
		progress_bar.modulate = Color(1.0, 0.2, 0.2)

func _on_lockdown_triggered() -> void:
	# 1. Turn on red tint vignette
	if red_tint_overlay:
		red_tint_overlay.visible = true
		# Pulsing red warning alarm animation
		var pulse_tween := create_tween().set_loops().set_trans(Tween.TRANS_SINE)
		pulse_tween.tween_property(red_tint_overlay, "color:a", 0.55, 0.6)
		pulse_tween.tween_property(red_tint_overlay, "color:a", 0.25, 0.6)

	# 2. Display "LOCKDOWN - EXORCISED" banner
	if lockdown_panel:
		lockdown_panel.visible = true
		lockdown_panel.modulate.a = 0.0
		var show_tween := create_tween()
		show_tween.tween_property(lockdown_panel, "modulate:a", 1.0, 0.4)

func _unhandled_input(event: InputEvent) -> void:
	# When in lockdown, allow clicking or pressing any key to restart
	if GameManager and GameManager.is_lockdown_active:
		if event is InputEventKey and event.pressed and event.keycode == KEY_R:
			GameManager.restart_level()
`
  }
];

export const ART_AND_LIGHTING_GUIDE = {
  worldEnvironment: {
    title: 'WorldEnvironment (Dark Moody Aesthetics & Neon Cyan Glow)',
    backgroundColor: '#0a1128',
    glowColor: '#00f3ff',
    steps: [
      '1. Add a WorldEnvironment node to your MainLevel scene.',
      '2. In the Inspector under "Environment", click `<empty>` and choose "New Environment".',
      '3. In Environment > Background:',
      '   - Mode: Set to "Clear Color" or "Custom Color".',
      '   - Color: Set to #0a1128 (Dark Navy/Midnight Blue).',
      '4. In Environment > Glow:',
      '   - Enabled: Toggle ON [x].',
      '   - Levels: Enable Level 1, Level 2, and Level 4 for soft ambient halo.',
      '   - Normalized: ON.',
      '   - Intensity: 1.25.',
      '   - Bloom: 0.20.',
      '   - Blend Mode: Additive or Screen.',
      '   - HDR Threshold: 1.0 (Crucial! Anything with raw color intensity > 1.0 will emit glow).',
      '5. Neon Cyan Glow Modulate on Ghost & Possessed Objects:',
      '   - In the Ghost/Possessable Sprite2D > Visibility > Modulate:',
      '   - In GDScript or Color Picker: set raw HDR color above 1.0, e.g., Color(0.0, 3.5, 4.0, 1.0) or hex #00f3ff multiplied by 3.5.',
      '   - Because it exceeds the HDR Threshold (1.0), Godot 4 automatically blooms it into a vivid supernatural cyan aura!'
    ]
  },
  pointLight2D: {
    title: 'PointLight2D (Flashlight Cone with Dynamic 2D Shadows)',
    flashlightColor: '#fff3a0',
    steps: [
      '1. Add a PointLight2D node as a child of GuardNPC.',
      '2. In Texture: Create or import a 90° or 60° flashlight cone mask (or GradientTexture2D with Radial fill and angle limitation).',
      '3. Position the PointLight2D offset slightly ahead of the guard hands (e.g. x: 18, y: 0).',
      '4. Set Color: #fff3a0 (Warm amber security flashlight), Energy: 1.2 to 1.6.',
      '5. Enable Shadows:',
      '   - Under PointLight2D > Shadows: Toggle Enabled to ON [x].',
      '   - Color: Color(0, 0, 0, 0.75) for soft ambient occluded darkness.',
      '   - Filter: PCF5 or PCF13 for smooth anti-aliased shadow penumbras.',
      '6. Wall Occlusion Setup:',
      '   - On each wall StaticBody2D or TileMapLayer, add LightOccluder2D nodes with OccluderPolygon2D.',
      '   - The flashlight beam will naturally cast realistic dark shadows behind walls and pillars!'
    ]
  },
  physicsLayers: [
    { layer: 1, name: 'World / Walls', description: 'Static level geometry, boundary walls, and pillars.' },
    { layer: 2, name: 'Ghost Player', description: 'Intangible spirit body. Collides only with World boundaries.' },
    { layer: 3, name: 'Possessables', description: 'RigidBody2D objects (Vases, Crates, Statues). Full physics with objects & world.' },
    { layer: 4, name: 'Guard NPCs', description: 'Security guards with CharacterBody2D walking and knockouts.' },
    { layer: 5, name: 'Vision / Triggers', description: 'Area2D flashlight cone query mask for fast-moving bodies.' }
  ]
};
