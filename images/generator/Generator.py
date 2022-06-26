from PIL import Image
from glob import glob
import os, numpy

path_to_train = '../'

glob_train_imgs = os.path.join(path_to_train, '*_fairy.jpg')
train_img_paths = glob(glob_train_imgs)
print(train_img_paths[:6])


# Access all PNG files in directory
allfiles=os.listdir('../../')
imlist=[filename for filename in allfiles if  filename[-4:] in ["*_fairy.jpg","*_fairy.JPG"]]
print(imlist)
# Assuming all images are the same size, get dimensions of first image
w,h=Image.open(train_img_paths[0]).size

N=len(train_img_paths)

# Create a numpy array of floats to store the average (assume RGB images)
arr=numpy.zeros((h,w,3),numpy.float)

# Build up average pixel intensities, casting each image as an array of floats
for im in train_img_paths:
    imarr=numpy.array(Image.open(im),dtype=numpy.float)
    arr=arr+imarr

arr = arr/N
# Round values in array and cast as 8-bit integer
arr=numpy.array(numpy.round(arr),dtype=numpy.uint8)

# Generate, save and preview final image
out=Image.fromarray(arr,mode="RGB")
out.save("Average_Fairy.png")
out.show()
