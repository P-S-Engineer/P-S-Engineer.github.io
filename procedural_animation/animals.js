
//general animal
class Animal extends CreaturesSpine
{
    constructor(template, head_size, body_length, spine_max_distance)
    {

        super();

        this.head_size = head_size;
        this.body_length = body_length;
        this.eyes = [];
        this.legs = [];
        this.fill_colour = "#a83a32";
        this.outline_colour = "#c1c1c1";
        this.outline_width = 2;

        let current_body_size = this.head_size;
        for(let i = 0; i<template.length; i++)
        {
            const spine_data = template[i];
            let segment_len = spine_data.max_size;
            
            if(spine_data.ratio != null)
            {
                segment_len = spine_data.ratio * this.body_length;
            }

            if(!spine_data.smooth_change)
                current_body_size = this.head_size;

            for(let j = 0; j < segment_len; j++)
            {
                current_body_size*=spine_data.change_size;
                this.add_spine_piece(current_body_size, spine_max_distance);
            }
        }
    }
    
    set_limb_colour(fill, outline)
    {
        for(let i=0; i < this.legs.length; i++)
        {
            this.legs[i].fill_colour = fill;
            this.legs[i].outline_colour = outline;
        }
    }
    
    compute_body_parts_locations()
    {
        for(let i=0; i < this.eyes.length; i++)
        {
            const eye = this.eyes[i];
            const spine_piece = this.spine_pieces[eye.spine_idx];

            this.eyes[i].calculate_positions(spine_piece.body_left, spine_piece.body_right);
        }
        for(let i=0; i < this.legs.length; i++)
        {
            this.legs[i].update_leg_position(this.spine_pieces[this.legs[i].spine_anchor_idx]);
        }
    }
}


//snake
//A snake is basically a worm but with some tapering towards the head and tail
const snake_spine_template = [
    {ratio:null, max_size:3, change_size:1.1}, //head
    {ratio:0.3, max_size:null, change_size:1}, //body
    {ratio:0.7, max_size:null, change_size:0.98} //tail
]
class Snake extends Animal
{
    constructor(screen_width)
    {
        const head_size = screen_width*0.025;
        const body_length = screen_width*0.085;

        super(snake_spine_template, head_size, body_length, head_size/2);

        const SPINE_IDX = 0;
        const DIST_FROM_EDGE = head_size/2.5;
        const EYE_SIZE = head_size/8;
        const OUTLINE_COLOUR = "white";
        const FILL_COLOUR = "white";

        this.eyes.push(new Eyes(SPINE_IDX, DIST_FROM_EDGE, EYE_SIZE, OUTLINE_COLOUR, FILL_COLOUR));

        this.fill_colour = "#3A40C2";
    }

}

//lizard
const lizard_spine_template = [
    {ratio:null, max_size:2, change_size:1.05}, //head
    {ratio:null, max_size:2, change_size:0.95, smooth_change:true}, //head lower
    {ratio:null, max_size:2, change_size:0.9, smooth_change:true}, //neck
    {ratio:null, max_size:3, change_size:1.1, smooth_change:true}, //shoulder upper
    {ratio:null, max_size:6, change_size:1, smooth_change:true}, //body
    {ratio:null, max_size:3, change_size:0.9, smooth_change:true}, //hip lower
    {ratio:0.9, max_size:null, change_size:0.9, smooth_change:true} //tail
]
class Lizard extends Animal
{
    constructor(screen_width)
    {
        const head_size = screen_width*0.03;
        const body_length = screen_width*0.025;

        console.log(head_size);

        super(lizard_spine_template, head_size, body_length, head_size/2);

        const SPINE_IDX = 0;
        const DIST_FROM_EDGE = head_size/2.5;
        const EYE_SIZE = head_size/8;
        const OUTLINE_COLOUR = "white";
        const FILL_COLOUR = "white";

        this.eyes.push(new Eyes(SPINE_IDX, DIST_FROM_EDGE, EYE_SIZE, OUTLINE_COLOUR, FILL_COLOUR));

        //With the legs we need to know how many joints they have
        //Also need to know how far they can get from the body
        //also need to know the spine peice they are attached to and the angle that they are attached
        const FRONT_LEG_SPINE_IDX = 8;
        const BACK_LEG_SPINE_IDX = 16;
        
        const LEFT_LEG_ANGLE = Math.PI * 0.5;
        const RIGHT_LEG_ANGLE = Math.PI * 1.5;

        const FRONT_LEG_MAX_DIST_FROM_BODY = head_size * 1.5;
        const BACK_LEG_MAX_DIST_FROM_BODY = head_size * 1.25;

        const FRONT_LEG_JOINT_DIST = head_size * 1;
        const BACK_LEG_JOINT_DIST = head_size * 0.98;

        
        const FRONT_DISTANCE_UNTIL_STEP = head_size*2.5;
        const BACK_DISTANCE_UNTIL_STEP = head_size*2;

        const LEG_WIDTH = head_size*0.25;


        this.legs.push(new Leg(FRONT_LEG_SPINE_IDX, LEFT_LEG_ANGLE, FRONT_LEG_MAX_DIST_FROM_BODY, FRONT_DISTANCE_UNTIL_STEP, LEG_WIDTH, FRONT_LEG_JOINT_DIST, this.fill_colour));
        this.legs.push(new Leg(FRONT_LEG_SPINE_IDX, RIGHT_LEG_ANGLE, FRONT_LEG_MAX_DIST_FROM_BODY, FRONT_DISTANCE_UNTIL_STEP, LEG_WIDTH, FRONT_LEG_JOINT_DIST, this.fill_colour));
        this.legs.push(new Leg(BACK_LEG_SPINE_IDX, LEFT_LEG_ANGLE, BACK_LEG_MAX_DIST_FROM_BODY, BACK_DISTANCE_UNTIL_STEP, LEG_WIDTH, BACK_LEG_JOINT_DIST, this.fill_colour));
        this.legs.push(new Leg(BACK_LEG_SPINE_IDX, RIGHT_LEG_ANGLE, BACK_LEG_MAX_DIST_FROM_BODY, BACK_DISTANCE_UNTIL_STEP, LEG_WIDTH, BACK_LEG_JOINT_DIST, this.fill_colour));
    }

}