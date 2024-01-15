
import os, time, shutil
from threading import Timer
from time import gmtime, strftime
import arcpy
from arcpy.sa import *


# Global variables:
systemCooldown = 2
Error_Limit = 1
mode = True
arcpy.env.overwriteOutput = True
arcpy.env.parallelProcessingFactor = "100%"
arcpy.CheckOutExtension("Spatial")

# File Path
Drive = "C"
Image = Drive + ":\\GIS\\Sentinel_Process\\Image\\"
Image_Pre = Drive + ":\\GIS\\Sentinel_Process\\Image_Pre\\"
Image_Finish = Drive + ":\\GIS\\Sentinel_Process\\Image_Finish\\"
Image_Missing = Drive + ":\\GIS\\Sentinel_Process\\Image_Missing\\"
Output = Drive + ":\\GIS\\Sentinel_Process\\Output\\"
Rtbcon = Drive + ":\\GIS\\Sentinel_Process\\Raster_BurnCon\\"
Rtbreg = Drive + ":\\GIS\\Sentinel_Process\\Raster_BurnReg\\"
RtbShape = Drive + ":\\GIS\\Sentinel_Process\\Raster_BurnShape\\"
Track_arr = ["T4\\","T104\\","T61\\","T18\\","T118\\"]

############################################### Function ##############################################################
def loadCooldown():
    global mode

def print_time():
    cmd_time = strftime("%Y-%m-%d %H:%M:%S   ", time.localtime())
    return cmd_time

def Move_File(FileName,CurrDir,DestDir):
    try:
        if arcpy.Exists(CurrDir + FileName):
            if arcpy.Exists(DestDir + FileName): os.remove(DestDir + FileName)
            shutil.copy(CurrDir + FileName, DestDir)
            t = Timer(1, loadCooldown)
            t.start()
            t.join()
            os.remove(CurrDir + FileName)
            print(print_time()+"Raster_Process :: Move File " + FileName + " Complate")
    except Exception as e:
        print(print_time()+"Raster_Process :: Can not Move File " + FileName)
        print(print_time() + str(e))

############################################### Raster_Process ########################################################
def Raster_Process(Track):
    global mode, Image, Image_Pre, Image_Finish, Image_Missing, Output, Error_Limit

    # Raster Loop
    Loop_Limit = 0
    arcpy.env.workspace = Image + Track
    rasters = arcpy.ListRasters('*B12.jp2*')
    arcpy.env.workspace = Output

    for raster in rasters: 
        if Loop_Limit > 0 :
            mode = True
            return
        Full_name = os.path.splitext(raster)[0]
        Mid_name = Full_name[:23]
        Short_name = Full_name[:6]
        BFB03 = Image_Pre + Track + Short_name + "_B03.jp2"
        BFB04 = Image_Pre + Track + Short_name + "_B04.jp2"
        BFB08 = Image_Pre + Track + Short_name + "_B08.jp2"
        BFB12 = Image_Pre + Track + Short_name + "_B12.jp2"
        BFB1210 = Image_Pre + Track + Short_name + "_B1210.jp2"
        BFNBR = Image_Pre + Track + Short_name + "_NBR.tif"

        AFB03 = Image + Track + Mid_name + "B03.jp2"
        AFB04 = Image + Track + Mid_name + "B04.jp2"
        AFB08 = Image + Track + Mid_name + "B08.jp2"
        AFB12 = Image + Track + Mid_name + "B12.jp2"
        AFB1210 = Image + Track + Mid_name + "B1210.jp2"

        if arcpy.Exists(BFB03) == True & arcpy.Exists(BFB04) == True & arcpy.Exists(BFB08) == True & arcpy.Exists(BFB12) == True & arcpy.Exists(AFB03) == True & arcpy.Exists(AFB04) == True & arcpy.Exists(AFB08) == True & arcpy.Exists(AFB12) == True :
            print(print_time()+"Raster_Process :: Start GIS Process Please Wait....")
            Loop_Limit = Loop_Limit + 1
            # Delete Old File
            print(print_time()+"Raster_Process :: Delete Old File")
            files = os.listdir(Output)
            for f in files:
                try:
                    os.remove(Output + f)  
                except:
                    try:
                        shutil.rmtree(Output + f)
                    except Exception as e:
                        print(print_time()+"Raster_Process :: Cannot Delete " + f)
                        print(print_time() + str(e))
                        break
                        
            print(print_time()+"Raster_Process :: Delete Old File Complate")
            t = Timer(3, loadCooldown)
            t.start()
            t.join()  

            # Process
            if arcpy.Exists(BFB1210) == False:
                print(print_time()+"Raster_Process :: Resample " + Short_name)
                arcpy.Resample_management(BFB12, Image_Pre + Track + Short_name + "_B1210.jp2","10 10","NEAREST")
            if arcpy.Exists(BFNBR) == False:
                print(print_time()+"Raster_Process :: NBR " + Short_name)
                NBR_CMD = Float(Raster(BFB08) - Raster(BFB1210)) / Float(Raster(BFB08) + Raster(BFB1210))
                NBR_CMD.save(Image_Pre + Track + Short_name + "_NBR.tif")
                del NBR_CMD

            if arcpy.Exists(AFB1210) == False:
                print(print_time()+"Raster_Process :: Resample " + Mid_name)
                arcpy.Resample_management(AFB12, Image + Track + Mid_name + "B1210.jp2","10 10","NEAREST")

            try:
                ########################################## Raster PROCESS ################################################
                print(print_time()+"Raster_Process :: Raster Process " + Full_name[:22])
                Pre_nbr = Raster(BFNBR)
                Post_nbr = Float(Raster(AFB08) - Raster(AFB1210)) / Float(Raster(AFB08) + Raster(AFB1210))
                #Post_ndvi = Float(Raster(AFB08) - Raster(AFB04)) / Float(Raster(AFB08) + Raster(AFB04))
                ########################################## Burn Condition ################################################
                print(print_time()+"Raster_Process :: Burn Raster Condition")
                dNBR = Pre_nbr - Post_nbr
                burnCon_LV1 = Con(((dNBR > 0.27) & (Post_nbr < 0.10)),1)
                burnCon_Final = Con(((burnCon_LV1 == 1) & (Raster(AFB08) < 2000) & (Raster(AFB08) > Raster(AFB03))),1)
                arcpy.CopyRaster_management(burnCon_Final,
                                            
                                            Rtbcon + Track + Full_name[:15] + ".tif","DEFAULTS","","","","","1_BIT")
                del dNBR
                del Pre_nbr
                del Post_nbr
                ##########################################################################################################
                print(print_time()+"Raster_Process :: RegionGroup")
                burnRegionGrp = RegionGroup(burnCon_Final,"FOUR","WITHIN","NO_LINK","")
                print(print_time()+"Raster_Process :: Region > 400")
                burnRegionGrp400 = Con(burnRegionGrp,1,0,"Count > 400")
                burnRegion = Con((burnRegionGrp400 == 1),1)
                print(print_time()+"Raster_Process :: Save Raster")
                arcpy.CopyRaster_management(burnRegion, Rtbreg + Track + Full_name[:15] + ".tif","DEFAULTS","","","","","1_BIT")
                print(print_time()+"Raster_Process :: Burn Raster Process Complate")
                ########################################## Vecter PROCESS #################################################
                burnReclass = Reclassify(burnRegion, "Value", "1 1",)
                arcpy.RasterToPolygon_conversion(burnReclass, RtbShape + Track + Full_name[:15], "SIMPLIFY", "VALUE")
                del burnReclass
                ########################################## Move File ######################################################
                del burnCon_LV1
                del burnCon_Final
                del burnRegionGrp
                del burnRegionGrp400
                del burnRegion
                print(print_time()+"Raster_Process :: Start Move File ")
                Move_File(Mid_name + "B03.jp2", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B04.jp2", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B08.jp2", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B12.jp2", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B1210.jp2", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B1210.jp2.aux.xml", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B1210.jp2.ovr", Image + Track, Image_Finish + Track)
                Move_File(Mid_name + "B1210.jp2.xml", Image + Track, Image_Finish + Track)
                Error_Limit = 2
                print(print_time()+"Raster_Process :: Raster_Process ALL Complate >>>>>>>>>>>>>>>>>>>> \n \n")
                ###########################################################################################################
            except Exception as e:
                print(print_time()+"Raster_Process :: !!!!!!!!!! RASTER ERROR !!!!!!!!!!")
                print(print_time() + str(e))
                Error_Limit = Error_Limit - 1
                if Error_Limit < 1 :
                    print(print_time()+"Raster_Process :: !!!!!!!!!! RASTER ERROR 2 Time MoveFile to Image_Missin")
                    Move_File(Mid_name + "B03.jp2", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B04.jp2", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B08.jp2", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B12.jp2", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B1210.jp2", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B1210.jp2.aux.xml", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B1210.jp2.ovr", Image + Track, Image_Missing + Track)
                    Move_File(Mid_name + "B1210.jp2.xml", Image + Track, Image_Missing + Track)
                    Error_Limit = 2
            ############################################## END Raster PROCESS################################################
        else :
            print(print_time()+"Raster_Process :: " + Full_name[:22] + " Image not Found !!!!")
            Move_File(Mid_name + "B03.jp2", Image + Track, Image_Missing + Track)
            Move_File(Mid_name + "B04.jp2", Image + Track, Image_Missing + Track)
            Move_File(Mid_name + "B08.jp2", Image + Track, Image_Missing + Track)
            Move_File(Mid_name + "B12.jp2", Image + Track, Image_Missing + Track)
            Move_File(Mid_name + "B1210.jp2.aux.xml", Image + Track, Image_Missing + Track)
            Move_File(Mid_name + "B1210.jp2.ovr", Image + Track, Image_Missing + Track)
            Move_File(Mid_name + "B1210.jp2.xml", Image + Track, Image_Missing + Track)
    print(print_time()+"Wait New Raster ::")
    mode = True

############################################### Main LOOP ############################################
def main():
    global mode, Image, Track_arr
    print(print_time()+"Application Start ::")
    while True:
        t = Timer(systemCooldown, loadCooldown)
        t.start()
        t.join()
        if mode==True:
            for Track in Track_arr:
                arcpy.env.workspace = Image + Track
                rasters = arcpy.ListRasters('*B12.jp2*')
                if rasters:
                    mode=False
                    print(print_time()+"Found NEW Raster :: ")
                    try:
                        Raster_Process(Track)
                    except Exception as e:
                        print(print_time() + "!!!!!!!!!SYSTEM ERROR !!!!!!!!!!")
                        print(print_time() + str(e))
                        print(print_time()+"Wait New Raster ::"+ "\n \n")
                        mode = True
######################################################################################################
if __name__ == "__main__": main()                                                                    #
######################################################################################################