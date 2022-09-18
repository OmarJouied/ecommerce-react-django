try:
    import os
    os.remove('./omar.gf')
except Exception as e:
    print(str(e))