{
    "_id": ObjectId("58f5173ec712876d64247bf9"),
    "name": "expert_menu",
    "title": "���� ��������",
    "data": {
        "name": "expert_menu",
        "title": "���� �������",
        "root_menu": "#top_menu",
        "items": [
            {
                "name": "menu_person_request",
                "title": "������",
                "root_menu": "#left_menu",
                "active": true,
                "items": [
                    {
                        "title": "����� ������",
                        "meta_action_type": "view",
                        "meta_class": "person_request",
                        "meta_view": "vw_new_persrequests",
                        "active": true
                    },
                    {
                        "title": "������ �� ����������",
                        "meta_action_type": "view",
                        "meta_class": "person_request",
                        "meta_view": "vw_expert_persrequests"
                    },
                    {
                        "title": "�������� ���� ",
                        "meta_action_type": "view",
                        "meta_class": "cfkp_product",
                        "meta_view": "vw_cfkp_product"
                    }
                ]
            },
            {
                "name": "user_menu",
                "title": "������ ������������",
                "root_menu": "#left_menu",
                "items": [
                    {
                        "title": "��� ������",
                        "meta_action_type": "view",
                        "meta_class": "users",
                        "meta_view": "vw_user_property",
                        "active": true
                    },
                    {
                        "title": "�������� ������",
                        "meta_action_type": "method",
                        "meta_class": "users",
                        "meta_method": "user_change_pass"
                    }
                ]
            }
        ]
    }
}