const FORWARDS = 1;
const BACKWARDS = -1;

//A limb is a spine that has been anchored to something
class Limb extends CreaturesSpine
{
    constructor(spine_anchor_idx, spine_anchor_angle)
    {
        super();
        this.spine_anchor_idx = spine_anchor_idx;
        this.spine_anchor_angle = spine_anchor_angle;
    }

    update_positions(target, anchor)
    {
        this.update_target(target);
        this.update_inbetween(FORWARDS);
        this.update_spine_anchor(anchor);
        this.update_inbetween(BACKWARDS);
    }

    update_inbetween(update_dir)
    {        
        let inc = 1;
        let start = 1;
        let end = this.get_num_spine_pieces()-1;
        let current_target = this.spine_pieces[0].center;

        if(update_dir == BACKWARDS)
        {
            inc = -1;
            start = this.get_num_spine_pieces()-2;
            end = 0;
            current_target = this.spine_pieces[this.get_num_spine_pieces()-1].center;
        }

        for (let i = start; i != end; i+=inc)
        {
            this.spine_pieces[i].update_position(current_target);
            current_target = this.spine_pieces[i].center;
        }
    }

    update_target(target)
    {
        this.spine_pieces[0].center = target;
    }

    update_spine_anchor(anchor)
    {
        //knowing the spine piece dir, radius
        //we can easily update the anchor pos
        const pos = calculate_new_position_on_circle(anchor.center, anchor.radius, anchor.dir_angle + this.spine_anchor_angle);

        this.spine_pieces[this.get_num_spine_pieces()-1].center = pos;

    }
}