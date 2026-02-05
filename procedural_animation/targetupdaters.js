
class GenericTargetUpdater
{
    constructor(intial_position, width, height, speed)
    {
        this.current_position = intial_position;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update_bounds(new_width, new_height)
    {
        this.width = new_width;
        this.height = new_height;
    }

    set_position(new_position)
    {
        this.current_position = new_position;
    }
    
    get_rand(start, range)
    {
        return (Math.random()*range) + start;
    }

    update_mouse_pos(x, y)
    {
        return;
    }
    
    is_near_enough(pos, target, range)
    {
        return (
            Math.abs(pos.x - target.x) < range
            &&  Math.abs(pos.y - target.y) < range
        )
    }
}

class FigureEightUpdater extends GenericTargetUpdater
{
    constructor(intial_position, width, height, speed)
    {
        super(intial_position, width, height, speed);
        
        this.border = 0.1;
        this.dir = 1;
        this.path_radius = 0;
        this.path_offset = 0;

        this.update_path_details();
    }

    update_bounds(new_width, new_height)
    {
        super.update_bounds(new_width, new_height);
        this.update_path_details();
    }

    update_path_details()
    {
        this.path_radius = (this.width * (this.border*2))/1.55; //dont know why 1.55 works lol
        this.path_offset = (this.width/2);   
    }

    update_position()
    {
        let x = this.current_position.x;

        this.set_dir(x);
        x += ((this.speed*0.5)*this.dir);

        const y = this.get_y_position((x - this.path_offset)/this.path_radius, 200 *this.dir) + this.height/2;

        this.current_position.x = x;
        this.current_position.y = y;
    }

    set_dir(x)
    {
        if (x > this.width * (1-this.border))
        {
            this.dir = -1;
        }
        else if (x < this.width * this.border)
        {
            this.dir = 1;
        }
    }

    get_y_position(x, radius)
    {
        return Math.sin(x)*radius;
    }
}

class RandomWalkUpdater extends GenericTargetUpdater
{
    constructor(intial_position, width, height, speed)
    {
        super(intial_position, width, height, speed);
        this.angle_change_counter = this.get_rand(width*0.1, width*0.6);
        this.current_angle = 0;
        this.border = 0.1;
    }

    get_oob()
    {
        return this.current_position.x < this.border * this.width
            || this.current_position.y < this.border * this.height
            || this.current_position.x > this.width - (this.width * this.border)
            || this.current_position.y > this.height - (this.height * this.border);
    }

    get_angle_bounds()
    {
        const angle_range = Math.PI/2;
        let min_angle = this.get_rand(Math.PI/4, Math.PI*1.5);
        
        if(this.get_oob())
        {
            //start to aim towards the centerish of the screen 
            const center_angle = Math.atan2(this.height/2 - this.current_position.y, this.width/2 - this.current_position.x);
            min_angle = center_angle - Math.PI/4;
        }
        return {angle_range, min_angle};
    }   

    update_position()
    {
        let angle_change_needed = false;

        this.angle_change_counter--;

        if (this.angle_change_counter <= 0)
        {
            angle_change_needed = true;
            this.angle_change_counter = this.get_rand(150, 250);
        }
        
        if(this.get_oob())
        {
            angle_change_needed = true;
        }


        if(angle_change_needed)
        {
            const bounds = this.get_angle_bounds();

            this.current_angle = this.get_rand(bounds.min_angle, bounds.angle_range);

            //make sure the angle is between 0 and 2PI
            this.current_angle %= Math.PI*2;
        }

        this.current_position = calculate_new_position_on_circle(this.current_position, this.speed*0.5, this.current_angle);
    }
}

class MouseUpdater extends GenericTargetUpdater
{
    constructor(intial_position, width, height, speed)
    {
        super(intial_position, width, height, speed);

        this.mouse_pos = new Point(0, 0);
    }

    update_mouse_pos(x, y)
    {
        this.mouse_pos.x = x;
        this.mouse_pos.y = y;
    }

    update_position()
    {
        //We are just chasing the mouse at max speed until we get there
        if(this.is_near_enough(this.current_position, this.mouse_pos, this.speed*2))
            return;

        const angle_to_mouse = Math.atan2(this.mouse_pos.y - this.current_position.y, this.mouse_pos.x - this.current_position.x);
        
        this.current_position = calculate_new_position_on_circle(this.current_position, this.speed, angle_to_mouse);
    }
}

class WalkAcrossUpdater extends GenericTargetUpdater
{
    constructor(intial_position, width, height, speed)
    {
        super(intial_position, width, height, speed);

        this.start_position = new Point(0, 0);
        this.end_position = new Point(0, 0);
        this.crossing_angle = 0;
        this.crossing_screen = false;
        this.exiting_screen = false;
        this.coords = [];
        this.resetting_position = false;

        this.create_coords()
    }


    update_bounds(new_width, new_height)
    {
        super.update_bounds(new_width, new_height);
        this.create_coords()
        this.crossing_screen = false;
        this.exiting_screen = false;
        this.resetting_position = false;
    }

    create_coords()
    {
        this.coords = [];

        //for each edge
        for(let i = 0; i < 4; i++)
        {
            let x = 0;
            let y = 0;
            if(i == 1)
            {
                y = this.height;
            }    
            if(i == 2)
            {
                x = this.width;
            }
            //split into 3 
            for(let j = 0; j < 3; j++)
            {
                const next_multiplier = 0.25 * (j+1);
                if(i%2 == 0)
                {
                    y = next_multiplier * this.height;
                }
                else
                {
                    x = next_multiplier * this.width;
                }

                this.coords.push(new Point(x, y));
            }
            
        }
    }

    update_tail_pos(new_tail_pos)
    {
        this.tail_pos = new_tail_pos;
    }

    reset_body_position()
    {
        //basically we just go put the head really far off screen and then put it back
        //to start point and the spine will sort itself out by the time we get on the screen
        this.current_position = structuredClone(this.start_position);

        if(this.start_position.x == 0)
        {
            this.current_position.x = -1000;
        }
        else if(this.start_position.x == this.width)
        {
            this.current_position.x = this.width +1000;
        }
        else if(this.start_position.y == 0)
        {
            this.current_position.y = -1000;
        }
        else if(this.start_position.y == this.height)
        {
            this.current_position.y = this.height +1000;
        }

        this.resetting_position = true;
    }

    update_position()
    {
        if(!this.crossing_screen)
        {
            this.crossing_screen = true;

            this.restart_crossing();

            this.reset_body_position();
            return;
        }
        if(this.resetting_position)
        {
            this.current_position = structuredClone(this.start_position);
            this.resetting_position = false;
        }

        if(this.exiting_screen && this.is_near_enough(this.tail_pos, this.end_position, this.speed*3))
        {
            this.exiting_screen = false;
            this.crossing_screen = false;
        }

        this.current_position = calculate_new_position_on_circle(this.current_position, this.speed, this.crossing_angle);

        if(this.is_near_enough(this.current_position, this.end_position, this.speed*2))
        {
            this.exiting_screen = true;
        }
    }

    restart_crossing()
    {
        //Not going to be completely random
        //will have 12 start and 7 end positions and we
        //just grab a random pair

        let start = this.get_rand(0, 11);
        start = Math.round(start);
        let end = this.get_rand(0,6);
        end = Math.round(end);

        end = (start + 2 + end) % 12;

        this.start_position = this.coords[start];
        this.end_position = this.coords[end];

        this.crossing_angle = Math.atan2(this.end_position.y - this.start_position.y, this.end_position.x - this.start_position.x);
    }
}