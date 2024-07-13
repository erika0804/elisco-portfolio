""""
Erika Lisco
Lab 5
10/13/2023

This script creates a GUI for a diary application. In the diary, the user can write anything they would like. It catalogs the entry by date and adds each date/entry as a key:value pair into an empty dictionary.
This dictionary is then saved into an empty text file called "diary_entries.txt". It preserves previous entries so when called upon, the script can read all previous entries.
It also gives the option to exit the diary whenever the user would like. 

I wanted to make the diary feel more like a real diary aesthetically and functionally, so I used online resources (the biggest one linked here, others linked throughout the code) to learn to make a GUI. 
Through this I learned how to create a window where the diary would exist, add buttons to the window, clear content from the window to add new content, add buttons, change text, change the size of the window, etc.
Almost all of my TKinter knowledge came from a YouTube playlist called Python GUI's with TKinter from the channel Codemy.com, the other resources linked throughout supplemented the video contents:
    Link: https://www.youtube.com/playlist?list=PLCC34OHNcOtoC6GglhF3ncJ5rLwQrLGnV

*pls write at least one entry before trying to click read entries button. Otherwise, because there are no entries to read yet, an error will occur.

"""
# ==========================
# Import Modules 
# ==========================

# Using tkinter to create GUI where diary is housed in a new window and you can click buttons to take you to different sections of the diary (write in diary and read diary)
    ## from tkinter, import everything
from tkinter import *
# Importing font class from tkinter so i can change TKinter's fonts to be bold, change the size, and font family 
    ## To see what the fonts looked like, I used this code: https://stackoverflow.com/questions/39614027/list-available-font-families-in-tkinter
from tkinter.font import Font
# Import datetime class from datetime module
  ## Learned about this module and function from https://www.geeksforgeeks.org/get-current-date-using-python/#
from datetime import datetime

#---------------------------------
# TKinter variables I used a lot
#---------------------------------

    #family = font family 
    #bg= background color
    #fg = font color
    #size = font size
    #padx = spacing to the left and right of widget
    #pady = spacing around top and bottom of widget
     ## when i used padding around a widget, it was all trial and error to see what looked best so values appear random

# -----------------------------------------------
# Assign variables to dictionary and empty file
# -----------------------------------------------

# Initialize empty dictionary called diary
diary = {}

# Assign variable "file_name" to the empty text file the dictionary will be populated in to
file_name = "diary_entries.txt"

#----------------------------
# Defining functions
#----------------------------

# Defining a new function to clear my window and then add new content to it
    ## Learned from: https://stackoverflow.com/questions/39726998/tkinter-python-3-clear-the-screen\
    ## It clears the "children" widgets in the entire window
    
def clear_page(): # Define function called clear_page
  for child in root.winfo_children(): # for each widget in the window, destroy the widget
    child.destroy() #rip child widgets </3

# Define a function so that a message is displayed before exiting the program 
    ## Used code from: https://stackoverflow.com/questions/66966673/how-do-i-display-a-message-before-closing-the-tkinter-window

def goodbye_message(): # Define function called goodbye_message
    clear_page() # Clearing page so only goodbye message shows up
    message = Label(root, text = "See you later!", font = Font(family = "Eras Bold ITC", size=30), bg = "#EFEAD8", fg = "#B09B71") # Creating text label for goodbye message, specifying font, background color, font color
    message.grid(row = 1, column = 0, padx=165, pady =150) # Putting label in window using grid function. All widgets have to be created first, then added to the window.
    root.after(1000, root.destroy) # using .after function so that after 1 second, the window is closed
    print("Goodbye!") # Print so user can see in code what's going on if they want

# Defining a new function for a button that's purpose is to take the user back to the main menu
def take_me_home(): # Define function called take_me_home
    print("Going home...") # Print so user can see in code what's going on if they want
    clear_page() # Clear the page

    # Basically recreate the start window (which we make after defining all these functions)
    root.geometry("600x400") # Establish the size of the window 
    welcome_label = Label(root, text= 'Welcome to your Diary!', font = Font(family = "Eras Bold ITC", size=22), bg = "#EFEAD8", fg = "#966C3B")# Create a line of text to welcome user to diary, specifying font, background color, font color
    welcome_label.grid(row=0, column=0, padx = 130, pady = 65) #Use grid function to map where in window the text will go. 

    # Make button frame for the page
    button_frame_home = Frame(root, bg = "#EFEAD8") # Add a button frame for the home page. This is like a little house for all the buttons on this page to live in.
    button_frame_home.grid(row=1, column=0) # Add the button frame to the window using grid function. 
    
    # Make buttons to populate the button frame
    # New entry button
    new_entry_button = Button(button_frame_home, text = "Write a new entry", font = Font(family = "Helvetica", size = 12, weight="bold"), bg = "#799078", fg = "#FCF8E8", command = take_me_to_new_entry, height = 2, width = 15) # Creates button to make new entry. It goes in the button_frame_home, it has text, and it's function is to take user to write a new entry (which is a function that has to be defined)
    new_entry_button.grid(row = 1, column = 0, padx = 5)  # Adds the button on the window using grid
    # Previous entry button
    prev_entries_btn = Button(button_frame_home, text= 'Read Previous Entries', font = Font(family = "Helvetica", size = 12, weight="bold"), bg = "#799078", fg = "#FCF8E8", command = read_entry, height = 2, width = 20) # Creates button to read previous entries. It goes in the button_frame_home, it has text, and it's function is to read the previous entries (which is a function that has to be defined)
    prev_entries_btn.grid(row=1,column=1, padx =10) # Adds the button on the window using grid
    # Exit diary button
    exit_button = Button(button_frame_home, text= "Exit Diary",font = Font(family = "Helvetica", size = 12, weight="bold"), bg = "#799078", fg = "#FCF8E8", command=goodbye_message, height = 2, width = 14) # Creates button to exit the window entirely. It goes in button_frame_home, it has text, and it's function is to exit diary using goodbye_message function
    exit_button.grid(row=1, column=2, padx = 10) # Adds the button on the window using grid. Increasing the column for each button so that they are next to each other horizontally. 
    print("Made it to home page!") # Print so user can see in code what's going on if they want
    
# Define new function that takes the user to a page where they can write a new diary entry
def take_me_to_new_entry():
    print("Going to new entry page...") # Print so user can see in code what's going on if they want
    clear_page() # Clear the page
    root.geometry("600x700") # Making window bigger than the home window so user can write more in the text box
    new_entry_label = Label(root, text= "What would you like to write about?", font = Font(family = "Eras Bold ITC", weight = "bold", size = 18), bg = "#EFEAD8", fg = "#876445") # Create line of text that indicates to the user that this text box is for writing a new entry, specifying font, background color, font color
    new_entry_label.grid(row=1, column = 0, padx = 30, pady = 20)  # Add the text to the window using grid function
    
    # Create the text box that the user will write their entry in
    new_entry_txt = Text(root, width=67, height = 28, font = ("Helvetica", 11), bg = "#FCF8E8") # Creates text box for the user to write their entry in, specifying font, background color, font color
    new_entry_txt.grid(row = 2, column = 0, padx = 27, pady = 5) # Puts the text box in the window

# Define new function that saves the entry to an empty dictionary, then appends new entries to the empty text file as date/time:entry format
    def save_entry():
        print("Saving entry...") # Print so user can see in code what's going on if they want
        save_label = Label(frame, text ="Entry Saved!", bg = "#EFEAD8", fg = "#698269", font= Font(family = "Helvetica", size = 13, weight = "bold")) # Create a line of text that tells the user their entry was saved when they click save button, specifying font, background color, font color
        save_label.grid(row = 3, column = 1) # Puts "Entry Saved!" text in the window
        new_entry = new_entry_txt.get(1.0, END) # Creating variable called new_entry that gets all the content from the text box where the user typed in their entry. It starts at 1.0 bc the .get function starts at 1.0 instead of 0.
        now = datetime.now() # gets current date and time 
        # the time kept showing up in 24-hr format, so I asked Chat GPT for help : https://chat.openai.com/share/7b62dca5-db97-4ec0-9262-dcec47a60156
        formatted_datetime = now.strftime("%m-%d-%Y, %I:%M:%S %p") # formats date and time so its Day-Month-Year and Hr:Min:Sec rather than 24-hr time. %I = time in 12-hr format. % p = AM or PM
        diary[formatted_datetime]: new_entry # Adds new entry to our diary dictionary with key in key:value pair as the date/time and value as the new entry
        with open(file_name, 'a') as f: # Opens the empty text file and appends each new entry from the dictionary into the text file
            f.write(f'{formatted_datetime} : {new_entry}\n') # Writes each entry into text file as date/time: entry
        print("Entry saved!") # Print so user can see in code what's going on if they want

    # Create save button to sit above all other buttons in window. Put it in a frame so when it is clicked, the "Entry Saved!" label that we made above shows up next to it
        ## To make the frame I used a combo of the video on frames from the Codemy YouTube channel and this code: https://www.geeksforgeeks.org/how-to-change-border-color-in-tkinter-widget/#
    frame = Frame(root, padx =5, pady =5, bg = "#EFEAD8") # Create button frame for save button
    frame.grid(row = 3, column =0) # Put frame in the window
    save_button = Button(frame, text="Save Text", command = save_entry, bg= "#865439", fg = "#FCF8E8" , width = 9, height = 1, font = Font(family = "Helvetica", size = 13, weight = "bold")) # Creates save button. Button put in button frame, given text, and when clicked the save_entry function is called
    save_button.grid(row=3, column=0, padx=25, pady = 10) # Puts save button in the frame

    # Create another button frame for the home and exit buttons to put on the new entry page
    button_frame = Frame(root, bg = "#EFEAD8") # Creates the button frame 
    button_frame.grid(row=4, column =0, pady = 20, padx = 4) # Puts the button frame in the window

    home_button = Button(button_frame, text = "Home", command = take_me_home, bg= "#C38154", fg = "#FCF8E8" , width = 9, height = 1, font = Font(family = "Helvetica", size = 13, weight = "bold")) # Creates home button. Button given text and when clicked the take_me_home function is called
    home_button.grid(row=4, column=1 , padx=20) # Puts home button in frame

    exit_button = Button(button_frame, text= "Exit Diary", command=goodbye_message, bg= "#C38154", fg = "#FCF8E8" , width = 9, height = 1, font = Font(family = "Helvetica", size = 13, weight = "bold")) # Creates exit button. Button given text and when clicked the goodbye_message function is called
    exit_button.grid(row=4, column=2, padx = 20) # Puts exit button in frame
    print("Made it to new entry page!") # Print so user can see in code what's going on if they want

# Defines function so user can read their previous entries
def read_entry():
    print("Going to previous entries...") # Print so user can see in code what's going on if they want
    clear_page() # Clears page contents
    root.geometry("600x700") # Making window bigger than home window so user can see more in the text box
    prev_entry_lbl = Label(root, text = "Previous entries:", font = Font(family = "Eras Bold ITC", weight = "bold", size = 18), bg = "#EFEAD8", fg = "#665A48") # Creates text that tells user what they are looking at, specifying font, background color, font color
    prev_entry_lbl.grid(row=1, column = 0, padx = 30, pady = 15) # Puts text in the window

    my_text = Text(root, width=67, height = 28, font = ("Helvetica", 11), bg = "#FCF8E8") # Creates text box to put all the content from the text file into
    my_text.grid(padx = 27, pady=5) # Puts text box in the window
    
    text_file = open(file_name, 'r') # Opens the text file we created in read mode. assigns this open text file to variable 'text_file'
    
    content = text_file.read() # reads the file now that it is open and in read mode. Assigns the contents of file to variable 'content'.
    
    my_text.insert(1.0, content) # inserts text from 'content' at the start of the current text in the text box. 
    
    text_file.close() # closes the text file

    # Buttons to put on the "read previous entries" page

    button_frame_prev = Frame(root, bg = "#EFEAD8") # Creates button frame for the 'read previous entries' page
    button_frame_prev.grid(row=3, column = 0, pady = 20) # Puts the button frame in the window

    exit_button = Button(button_frame_prev, text= "Exit Diary", command=goodbye_message, bg= "#C38154", fg = "#FCF8E8" , width = 10, height = 1, font = Font(family = "Helvetica", size = 13, weight = "bold")) # Creates exit button. 
    exit_button.grid(row=3, column=3, padx = 20) # Puts exit button in the frame

    home_button = Button(button_frame_prev, text = "Home", command = take_me_home, bg= "#C38154", fg = "#FCF8E8" , width = 10, height = 1, font = Font(family = "Helvetica", size = 13, weight = "bold")) # Creates home button. When clicked, takes user home using take_me_home function
    home_button.grid(row=3, column=2 , padx=20) # Puts home button in the frame
    print("Made it to previous entries!") # Print so user can see in code what's going on if they want

#---------------------------
# Create the initial window 
#---------------------------

root = Tk() # Root = the name of the window, it can be called anything rly. using .Tk() class to create the window.
print("Welcome to your diary!") # Print so user can see in code what's going on if they want
root.title("My Diary") # Giving window a title
root.geometry("600x400") # Establishing size of our window. 
root.configure(bg = "#EFEAD8") # Gives the window a background color
welcome_label = Label(root, text= 'Welcome to your Diary!', font = Font(family = "Eras Bold ITC", size=22), bg = "#EFEAD8", fg = "#966C3B") # Creating line of text to welcome user to their diary, specifying font, background color, font color
welcome_label.grid(row=0, column=0, padx = 130, pady = 65) # Add text to window using .grid

# ------------------------------------
# Create buttons for initial window
# ------------------------------------

## Create initial home page buttons. These are buttons that appear as soon as you open the page. These are the same as the buttons in take_me_home. 
    ## There's probably an easier way to do this that doesn't require me to write this all out again, but im okay with this for now

# Make button frame 
button_frame_home = Frame(root, bg = "#EFEAD8") # Specify where button frame goes and gives the frame a background color
button_frame_home.grid(row=1, column=0, padx=4) # Putting frame in window

# Add new entry button
new_entry_btn = Button(button_frame_home, text = "Write A New Entry", font = Font(family = "Helvetica", size = 12, weight="bold"), bg = "#799078", fg = "#FCF8E8", command = take_me_to_new_entry, height = 2, width = 15) # Creating button to write a new entry. Adding text, changing font, creating text color and button color, assigning to command take_me_to_new_entry
new_entry_btn.grid(row = 1, column = 0, padx=5) # Add button to button frame using grid function

# Read previous entries button
prev_entries_btn = Button(button_frame_home, text= 'Read Previous Entries', font = Font(family = "Helvetica", size = 12, weight="bold"), bg = "#799078", fg = "#FCF8E8", command = read_entry, height = 2, width = 20) # Creating button to go to previous entries. Adding text, changing font, creating text color and button color, assigning to command read_entry
prev_entries_btn.grid(row=1,column=1, padx =10) # Add button to button frame using grid function

# Exit the program button
exit_button = Button(button_frame_home, text= "Exit Diary",font = Font(family = "Helvetica", size = 12, weight="bold"), bg = "#799078", fg = "#FCF8E8", command=goodbye_message, height = 2, width = 14) # Creating button to exit program. Adding text, changing font, creating text color and button color, assigning to command goodbye_message
exit_button.grid(row=1, column=2, padx = 10) # Add button to frame using grid function

# --------------------------------------
# Starting and Stopping the program
# --------------------------------------

# Using root.protocol to handle what happens when user exits the window
    ## Stack overflow response that helped me: https://stackoverflow.com/questions/111155/how-do-i-handle-the-window-close-event-in-tkinter
root.protocol("WM_DELETE_WINDOW", goodbye_message) #"WM_DELETE_WINDOW" is used to execute a function when user tries to exit the window. The function is the goodbye_message function defined above

root.mainloop() # In TKinter, the program starts running once .mainloop() function is called, and will continue to run until an event breaks it, like the exit diary button or the user just exiting out of the window. 
