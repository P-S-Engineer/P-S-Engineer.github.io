class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class Colour
{
    constructor(fill, outline)
    {
        this.fill = fill;
        this.outline = outline;
        this.line_width = 2;
    }
}
class Circle
{
    constructor(center, radius)
    {
        this.center = center;
        this.radius = radius;
        this.start_angle = 0;
        this.end_angle = 2*Math.PI;
    }
}

function calculate_new_position_on_circle(center, radius, angle)
{
    const x = (radius * Math.cos(angle)) + center.x;
    const y = (radius * Math.sin(angle)) + center.y;

    return new Point(x,y);
}

function calculate_similar_triangle(current_position, target_position, distance_from_target)
{
    const dx = target_position.x - current_position.x;
    const dy = target_position.y - current_position.y;

    let dirx = 1;
    let diry = 1;
    if (dx > 0) dirx *= -1;
    if (dy > 0) diry *= -1;

    const dist_target = Math.sqrt(dy*dy+dx*dx)

    const ratio = (distance_from_target/dist_target);

    const delta_x = Math.abs(dx*ratio);
    const delta_y = Math.abs(dy*ratio);

    const x = target_position.x + (delta_x * dirx);
    const y = target_position.y + (delta_y * diry);

    return new Point(x, y);

}