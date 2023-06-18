import os
from flask import Flask, jsonify
from dotenv import load_dotenv, find_dotenv
from supabase import create_client, Client
import json

# https://github.com/supabase-community/supabase-py
app = Flask(__name__)

# Connect to database
load_dotenv(find_dotenv())
hash_key: str = os.environ["HASH_KEY"]
url: str = os.environ["SUPABASE_URL"]
supabase = create_client(url, hash_key)

@app.route("/")
def main():
    return "<p>Backend<P>"

@app.route("/api/books", methods=['GET'])
def get_books():
    data = supabase.table("book_data").select("Title").gt("Read Count", 0).execute()
    return json.dumps(data.data)

@app.route("/api/test", methods=['GET'])
def test():
    return json.dumps({"test": "1",
            "test2": "2"})

if __name__ == '__main__':
    app.run(port=8000,debug=True)