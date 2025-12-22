import pandas as pd

data = {
    'Product_ID': [101, 102, 103, 104, 105],
    'Product_Name': ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Charger'],
    'Category': ['Electronics', 'Electronics', 'Electronics', 'Accessories', 'Accessories'],
    'Units_Sold': [30, 50, 20, 70, 90],
    'Unit_Price': [800, 500, 300, 100, 20],
    'Revenue': [24000, 25000, 6000, 7000, 1800]
}

df = pd.DataFrame(data)