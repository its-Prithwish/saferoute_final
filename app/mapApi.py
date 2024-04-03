from flask import Blueprint, jsonify
from . import map_api_functions

map_api_bp = Blueprint('map_api', __name__)

@map_api_bp.route('/hi')
def map_default():
    return "hi"

@map_api_bp.route('/map_data', methods=['GET'])
def get_map_data():
    # map_data = map_api_functions.get_map_data()
    print("<=== some one called me ===>")
    # return jsonify(map_dat)
    return "map_data"

@map_api_bp.route('/other_map_data', methods=['GET'])
def other_map_data():
    result_data = map_api_functions.other_map_api_function()
    # return jsonify(result_data)
    return jsonify("{'name': 'other_map_data}")
