//This holds the objects for the creatures spine
//basically a load of circles that follow eachother

class CreaturesSpine
{
    constructor()
    {
        this.spine_pieces = [];
        this.head_curve;
        this.tail_curve;
    }

    get_final_piece_pos()
    {
        return this.spine_pieces[this.get_num_spine_pieces()-1].center;
    }

    get_num_spine_pieces()
    {
        return this.spine_pieces.length;
    }

    add_spine_piece(radius, max_dist_target)
    {
        this.spine_pieces.push(new SpinePiece(radius, max_dist_target));
    }

    update_position(target_position)
    {
        let current_target = target_position;
        for (let i = 0; i < this.get_num_spine_pieces(); i++)
        {
            this.spine_pieces[i].update_position(current_target);
            current_target = this.spine_pieces[i].center;

            //This is where you should constrain the angles!
        }

        //SpinePiece.update_position will also create the body points
        //Just need to create the head and tail curves now

        this.head_curve_details = this.create_curve(
            this.spine_pieces[0].center,
            this.spine_pieces[0].radius, 
            this.spine_pieces[0].body_left, 
            this.spine_pieces[0].body_right
        );

        const tail_idx = this.get_num_spine_pieces()-1;
        this.tail_curve_details = this.create_curve(
            this.spine_pieces[tail_idx].center,
            this.spine_pieces[tail_idx].radius, 
            this.spine_pieces[tail_idx].body_left, 
            this.spine_pieces[tail_idx].body_right
        );
    }

    create_curve(center, radius, start, end)
    {
        //get values of a curve to draw
        const start_angle = Math.atan2(center.y - start.y, center.x - start.x);
        const end_angle = Math.atan2(center.y - end.y, center.x - end.x);

        let curve = new Circle(center, radius);
        curve.start_angle = start_angle;
        curve.end_angle = end_angle;
        return curve;
    }
}

class SpinePiece
{
    constructor(radius, max_dist_target)
    {
        this.center = new Point(0,0);
        this.radius = radius;
        this.max_dist_target = max_dist_target;
        this.dir_angle = 0;
        this.body_left = new Point(0,0);
        this.body_right = new Point(0,0);
    }

    update_position(target)
    {
        this.center = calculate_similar_triangle(this.center, target, this.max_dist_target);
        
        this.get_body_bounds(target);
    }

    get_body_bounds(target)
    {
        //Use the direction of travel to get the left and right body bounds
        this.dir_angle = Math.atan2(target.y - this.center.y, target.x - this.center.x);

        this.body_left = calculate_new_position_on_circle(this.center, this.radius, this.dir_angle + (Math.PI/2));
        this.body_right = calculate_new_position_on_circle(this.center, this.radius, this.dir_angle - (Math.PI/2));
    }
}