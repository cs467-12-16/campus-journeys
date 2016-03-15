npm i
npm i http-server -g

# this line runs all data processing and manipulations
# it takes a while to run, but the resulting files should 
# already by available, so it's not necessary to run
sh process_all_data.sh

http-server