import org.openkinect.processing.*; //<>//

// Kinect Library object
Kinect2 kinect2;

// Angle for rotation
float a = 0;
 float rX = 0.5;
  float rY = 0.5;

float minThresh = 4;
float maxThresh = 3000;

void setup() {
  
  size(2000, 1200, P3D);
  //fullScreen();
  kinect2 = new Kinect2(this);
  kinect2.initDepth();
  kinect2.initDevice();
}


void draw() {
  background(0);

  pushMatrix();
  translate(width/2, height/4, -2750);
  

  rotateY(frameCount*0.01);
  int skip = 4;

  int[] depth = kinect2.getRawDepth();

  float sumX = 0;
  float sumY = 0;
  float totalPixels = 0;
  strokeWeight(2);
  beginShape(POINTS);
  for (int x = 0; x < kinect2.depthWidth; x+=skip) {
    for (int y = 0; y < kinect2.depthHeight; y+=skip) {
      int offset = x + y * kinect2.depthWidth;
      int d = depth[offset];//0-4500
      //calculte the x, y, z camera position based on the depth information
      PVector point = depthToPointCloudPos(x, y, d);
      
         if (d > minThresh && d < maxThresh && x > 100) {
 
      sumX += x;
      sumY += y;
        totalPixels++;
  float c= map(d,0,2400,0,360);
      // Draw a point
      
      if(c>0 && c<255){
        colorMode(HSB,100);
       stroke(color(int(c),1,100));
       
      }
      else{
      stroke(100,1,100);
      }
      //draw pointcloud
      vertex(point.x, point.y, point.z);

    }
    }
  }
  endShape();

  popMatrix();
  
  float avgX = sumX / totalPixels;
  float avgY = sumY / totalPixels;

   PVector point2 = depthToPointCloudPos(int(avgX), int(avgY), avgX);
   pushMatrix();
   fill(150, 0, 255);
   translate(point2.x, point2.y, 1300);
   sphere(640);
     
     popMatrix();
  
 rX = lerp(map((avgX-1)/avgX,0,1,0,50),0,0.5);
 rY = map(avgY,0,2000,0,50);

  //fill(255);
  //text(frameRate, 50, 50);

  // Rotate
  rX += 0.0015;
}



//calculte the xyz camera position based on the depth data
PVector depthToPointCloudPos(int x, int y, float depthValue) {
  PVector point = new PVector();
  point.z = (depthValue);// / (1.0f); // Convert from mm to meters
  point.x = (x - CameraParams.cx) * point.z / CameraParams.fx;
  point.y = (y - CameraParams.cy) * point.z / CameraParams.fy;
  return point;
}
