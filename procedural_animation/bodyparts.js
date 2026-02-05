
class Eyes
{
    //eyes will be placed inside the head 
    constructor(spine_idx, offset, size, outline_colour, fill_colour)
    {
        this.spine_idx = spine_idx;
        this.offset = offset;
        this.size = size;
        this.outline_colour = outline_colour;
        this.fill_colour = fill_colour;
        this.left_position = new Point(0,0);
        this.right_position = new Point(0,0);
    }

    calculate_positions(spine_left, spine_right)
    {
        this.left_position = calculate_similar_triangle(spine_right, spine_left, this.offset);
        this.right_position = calculate_similar_triangle(spine_left, spine_right, this.offset);
    }
}

class Leg extends Limb
{
    constructor(spine_anchor_idx, spine_anchor_angle, distance_from_body, distance_until_step, width, joint_dist, colour)
    {
        super(spine_anchor_idx, spine_anchor_angle);
        this.length = length;
        this.distance_from_body = distance_from_body;
        this.current_target_position = new Point(0, 0);
        this.fill_colour = colour;
        this.outline_colour = "#c1c1c1";
        this.outline_width = 2;
        this.distance_until_step=distance_until_step;

        //Number of spine peices should be length/distance between them
        const num_pieces = 3;
        
        //radius of the spine is width
        for(let i = 0; i < num_pieces; i++)
        {
            this.add_spine_piece(width, joint_dist);
        }
    }

    update_leg_position(body_peice)
    {
        let angle = body_peice.dir_angle + this.spine_anchor_angle;
        if(this.spine_anchor_angle > Math.PI)
        {
            angle += (Math.PI/8);
        }
        else
        {
            angle -= (Math.PI/8);
        }
        const new_position = calculate_new_position_on_circle(body_peice.center, (body_peice.radius + this.distance_from_body), angle);

        const dx = Math.abs(new_position.x - this.current_target_position.x);
        const dy = Math.abs(new_position.y - this.current_target_position.y);

        const distance = Math.sqrt((dx*dx)+(dy*dy));

        if(distance > this.distance_until_step)
        {
            this.current_target_position = new_position;
        }

        this.update_positions(this.current_target_position, body_peice);
    }

}