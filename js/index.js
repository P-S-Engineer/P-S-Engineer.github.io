

const circle_radius = 3;
let creature;
let target_updater;
let current_creature_type = "snake";
let current_target_type = "figure8";
let mouseX = 0;
let mouseY = 0;
let current_speed = 2;
let should_draw_body = true;
let should_draw_legs = true;
let should_draw_debug_lines = false;
let should_draw_debug_points = false;

let creatureArea = {
    start : function() {
        this.canvas = document.getElementById("creature-canvas");
        this.parent_div = document.getElementById("canvas-container");
        let rect = this.canvas.getBoundingClientRect();
        this.mouse_offset = new Point(rect.x, rect.y);
        this.resize();
        this.context = this.canvas.getContext("2d");
        },
    resize : function(){
        const parent_style = window.getComputedStyle(this.parent_div, null);
        const paddingLeft = parseFloat(parent_style.paddingLeft) ; 
        const paddingRight = parseFloat(parent_style.paddingRight);
        this.canvas.width = this.parent_div.clientWidth - (paddingLeft +paddingRight);
        this.canvas.height = this.canvas.width*0.75;
        
        let rect = this.canvas.getBoundingClientRect();
        this.mouse_offset = new Point(rect.x, rect.y);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function change_creature() 
{
    new_creature_type = document.getElementById("select-creature").value;
    if(new_creature_type != current_creature_type)
    {
        current_creature_type = new_creature_type;
        change_target(current_target_type);
        restart();
    }
}

function change_target()
{   
    new_target_type = document.getElementById("select-target").value;
    const width = creatureArea.canvas.width;
    const height = creatureArea.canvas.height;
    if(new_target_type == "figure8")
    {
        target_updater = new FigureEightUpdater(new Point(width/2, height/2), width, height, current_speed);
    }
    else if (new_target_type == "mouse")
    {
        target_updater = new MouseUpdater(new Point(width/2, height/2), width, height, current_speed);
    }
    else if (new_target_type == "randwalk")
    {
        target_updater = new RandomWalkUpdater(new Point(-100, -100), width, height, current_speed);
    }
    else if (new_target_type == "randpath")
    {
        target_updater = new WalkAcrossUpdater(new Point(-100, -100), width, height, current_speed);
    }
    current_target_type = new_target_type;
}

function setup()
{
    window.onresize = function () {
        creatureArea.resize();
        target_updater.update_bounds(creatureArea.canvas.width, creatureArea.canvas.height);
        restart();
    }
    document.getElementById("creature-canvas").onmousemove = function (evt){
        mouseX = evt.clientX - creatureArea.mouse_offset.x;
        mouseY = evt.clientY - creatureArea.mouse_offset.y;
        target_updater.update_mouse_pos(mouseX, mouseY);
    };

    document.getElementById("range-speed").addEventListener("input", (event) => {
        target_updater.speed = event.target.value;
        current_speed = target_updater.speed;
    });
    
    document.querySelectorAll("input[type='color']").forEach(element => {
        element.addEventListener("input",apply_colours);
    });
    document.querySelectorAll("input[type='checkbox']").forEach(element => {
        element.addEventListener("input", apply_draw_options);
    });

    creatureArea.start();
    current_speed = document.getElementById("range-speed").value;
    change_target();
    change_creature();
    restart();
    mainloop();
}


function apply_draw_options()
{
    should_draw_body = document.getElementById("draw-body-check").checked;
    should_draw_legs = document.getElementById("draw-legs-check").checked;
    should_draw_debug_lines = document.getElementById("draw-debug-line-check").checked;
    should_draw_debug_points = document.getElementById("draw-debug-points-check").checked;
}

function apply_colours()
{
    const body_fill = document.getElementById("body-color-picker").value;
    const body_outline = document.getElementById("body-outline-picker").value;
    const limb_fill = document.getElementById("limb-color-picker").value;
    const limb_outline = document.getElementById("limb-outline-picker").value;


    creature.fill_colour = body_fill;
    creature.outline_colour = body_outline;

    creature.set_limb_colour(limb_fill, limb_outline);
}

function restart()
{
    if(current_creature_type == "snake")
    {
        creature = new Snake(creatureArea.canvas.width);
    }
    else if (current_creature_type == "lizard")
    {
        creature = new Lizard(creatureArea.canvas.width);
    }
    else
    {
        console.log("Dont know what the creature is");
    }
    apply_colours();
    apply_draw_options();
}

function update_target_position()
{
    target_updater.update_position();

    if(target_updater.exiting_screen)
    {
        target_updater.update_tail_pos(creature.get_final_piece_pos());
    }
}

function update_creature_position()
{
    creature.update_position(target_updater.current_position);
    creature.compute_body_parts_locations();
}

function redraw_canvas() 
{
    creatureArea.clear()

    if(creature == null)
    {
        return;
    }

    if(should_draw_legs)
        draw_legs(creature.legs);
    if(should_draw_body)
    {
        draw_main_body_outline(creature);
        draw_eyes(creature.eyes);
    }

    if(should_draw_debug_lines)
        draw_debug_circles();

    if(should_draw_debug_points)
        draw_body_points();
}


function mainloop()
{
    update_target_position();
    update_creature_position();

    redraw_canvas();
    requestAnimationFrame(mainloop);
}


function draw_debug_circles()
{
    let ctx = creatureArea.context;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    creature.spine_pieces.forEach(element => 
    {
        const x = element.center.x;
        const y = element.center.y;
        const radius = element.radius;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI);
        
        ctx.stroke();
    });
    creature.legs.forEach(element => {
        element.spine_pieces.forEach(piece => {
            ctx.beginPath();
            ctx.arc(piece.center.x, piece.center.y, piece.radius, 0, 2*Math.PI);
            ctx.stroke();
        });
    });
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.arc(target_updater.current_position.x, target_updater.current_position.y, circle_radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

function draw_body_points()
{
    let ctx = creatureArea.context;
    ctx.lineWidth = 1;

    draw_spine_points(ctx, creature);
}

function draw_spine_points(ctx, spine)
{
    spine.spine_pieces.forEach(piece => {
        ctx.strokeStyle = "green";
        ctx.fillStyle = "green";

        ctx.beginPath();
        ctx.arc(piece.body_left.x, piece.body_left.y, 2, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = "yellow";
        ctx.fillStyle = "yellow";

        ctx.beginPath();
        ctx.arc(piece.body_right.x, piece.body_right.y, 2, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
    });
}

function draw_partial_curve(ctx, details, anti_clockwise)
{
    //Anticlockwise just inverts start and end angles
    //this makes sure the creature body all matches up with
    //the outline and the fill works correctly
    if(anti_clockwise)
    {
        ctx.arc(details.center.x, details.center.y, details.radius, details.end_angle, details.start_angle, true);
    }
    else
    {
        ctx.arc(details.center.x, details.center.y, details.radius, details.start_angle, details.end_angle, true);
    }   
}

function draw_curved_line(ctx, mid_point, end_point)
{
    //draws a line through all points supplied
    ctx.quadraticCurveTo(mid_point.x, mid_point.y, end_point.x, end_point.y);
}

function draw_main_body_outline(creature)
{
    let ctx = creatureArea.context;
    ctx.beginPath();
    
    creature.spine_pieces.forEach(element => {
        ctx.lineTo(element.body_right.x, element.body_right.y);
    });
    draw_partial_curve(ctx, creature.tail_curve_details, false);

    creature.spine_pieces.toReversed().forEach(element => {
        ctx.lineTo(element.body_left.x, element.body_left.y);
    });
    draw_partial_curve(ctx, creature.head_curve_details, true);
    

    ctx.fillStyle = creature.fill_colour;
    ctx.strokeStyle = creature.outline_colour;
    ctx.lineWidth = creature.outline_width;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function draw_eyes(eyes)
{
    let ctx = creatureArea.context;
    eyes.forEach(element => {
        ctx.beginPath();
        ctx.arc(element.left_position.x, element.left_position.y, element.size, 0, 2*Math.PI);
        
        ctx.fillStyle = element.outline_colour;
        ctx.strokeStyle = element.fill_colour;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        
        ctx.beginPath();
        ctx.arc(element.right_position.x, element.right_position.y, element.size, 0, 2*Math.PI);
        
        ctx.fillStyle = element.outline_colour;
        ctx.strokeStyle = element.fill_colour;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    });
}


function draw_legs(legs)
{
    let ctx = creatureArea.context;

    legs.forEach(element => {

        const foot = element.spine_pieces[0];
        const knee = element.spine_pieces[1];
        const shoulder = element.spine_pieces[2];

        //Shoulder and feet curves
        ctx.strokeStyle = element.outline_colour;
        ctx.fillStyle = element.fill_colour;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(foot.center.x, foot.center.y, foot.radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(shoulder.center.x, shoulder.center.y, shoulder.radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        //outline
        ctx.lineWidth = foot.radius*2.5;
        ctx.beginPath();
        ctx.moveTo(foot.center.x, foot.center.y);
        draw_curved_line(ctx, knee.center, shoulder.center);
        ctx.stroke();

        //fill
        ctx.lineWidth = (foot.radius*2.5) - 4;
        ctx.strokeStyle = element.fill_colour;
        ctx.beginPath();
        ctx.moveTo(foot.center.x, foot.center.y);
        draw_curved_line(ctx, knee.center, shoulder.center);
        ctx.stroke();
        
    });

}