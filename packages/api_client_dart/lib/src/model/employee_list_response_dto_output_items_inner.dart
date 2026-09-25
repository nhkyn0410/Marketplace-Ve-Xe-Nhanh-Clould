//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'employee_list_response_dto_output_items_inner.g.dart';

/// EmployeeListResponseDtoOutputItemsInner
///
/// Properties:
/// * [id] 
/// * [username] 
/// * [contactEmail] 
/// * [role] 
/// * [status] 
/// * [credentialDeliveryPending] 
/// * [createdAt] 
/// * [updatedAt] 
@BuiltValue()
abstract class EmployeeListResponseDtoOutputItemsInner implements Built<EmployeeListResponseDtoOutputItemsInner, EmployeeListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'username')
  String get username;

  @BuiltValueField(wireName: r'contactEmail')
  String? get contactEmail;

  @BuiltValueField(wireName: r'role')
  EmployeeListResponseDtoOutputItemsInnerRoleEnum get role;
  // enum roleEnum {  DRIVER,  TICKET_STAFF,  SUPPORT_STAFF,  };

  @BuiltValueField(wireName: r'status')
  EmployeeListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  ACTIVE,  LOCKED,  DISABLED,  };

  @BuiltValueField(wireName: r'credentialDeliveryPending')
  bool get credentialDeliveryPending;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  EmployeeListResponseDtoOutputItemsInner._();

  factory EmployeeListResponseDtoOutputItemsInner([void updates(EmployeeListResponseDtoOutputItemsInnerBuilder b)]) = _$EmployeeListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EmployeeListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EmployeeListResponseDtoOutputItemsInner> get serializer => _$EmployeeListResponseDtoOutputItemsInnerSerializer();
}

class _$EmployeeListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<EmployeeListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [EmployeeListResponseDtoOutputItemsInner, _$EmployeeListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'EmployeeListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EmployeeListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'username';
    yield serializers.serialize(
      object.username,
      specifiedType: const FullType(String),
    );
    yield r'contactEmail';
    yield object.contactEmail == null ? null : serializers.serialize(
      object.contactEmail,
      specifiedType: const FullType.nullable(String),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(EmployeeListResponseDtoOutputItemsInnerRoleEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(EmployeeListResponseDtoOutputItemsInnerStatusEnum),
    );
    yield r'credentialDeliveryPending';
    yield serializers.serialize(
      object.credentialDeliveryPending,
      specifiedType: const FullType(bool),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EmployeeListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EmployeeListResponseDtoOutputItemsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'username':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.username = valueDes;
          break;
        case r'contactEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactEmail = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EmployeeListResponseDtoOutputItemsInnerRoleEnum),
          ) as EmployeeListResponseDtoOutputItemsInnerRoleEnum;
          result.role = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EmployeeListResponseDtoOutputItemsInnerStatusEnum),
          ) as EmployeeListResponseDtoOutputItemsInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'credentialDeliveryPending':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.credentialDeliveryPending = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EmployeeListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EmployeeListResponseDtoOutputItemsInnerBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class EmployeeListResponseDtoOutputItemsInnerRoleEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRIVER')
  static const EmployeeListResponseDtoOutputItemsInnerRoleEnum DRIVER = _$employeeListResponseDtoOutputItemsInnerRoleEnum_DRIVER;
  @BuiltValueEnumConst(wireName: r'TICKET_STAFF')
  static const EmployeeListResponseDtoOutputItemsInnerRoleEnum TICKET_STAFF = _$employeeListResponseDtoOutputItemsInnerRoleEnum_TICKET_STAFF;
  @BuiltValueEnumConst(wireName: r'SUPPORT_STAFF')
  static const EmployeeListResponseDtoOutputItemsInnerRoleEnum SUPPORT_STAFF = _$employeeListResponseDtoOutputItemsInnerRoleEnum_SUPPORT_STAFF;

  static Serializer<EmployeeListResponseDtoOutputItemsInnerRoleEnum> get serializer => _$employeeListResponseDtoOutputItemsInnerRoleEnumSerializer;

  const EmployeeListResponseDtoOutputItemsInnerRoleEnum._(String name): super(name);

  static BuiltSet<EmployeeListResponseDtoOutputItemsInnerRoleEnum> get values => _$employeeListResponseDtoOutputItemsInnerRoleEnumValues;
  static EmployeeListResponseDtoOutputItemsInnerRoleEnum valueOf(String name) => _$employeeListResponseDtoOutputItemsInnerRoleEnumValueOf(name);
}

class EmployeeListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const EmployeeListResponseDtoOutputItemsInnerStatusEnum ACTIVE = _$employeeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'LOCKED')
  static const EmployeeListResponseDtoOutputItemsInnerStatusEnum LOCKED = _$employeeListResponseDtoOutputItemsInnerStatusEnum_LOCKED;
  @BuiltValueEnumConst(wireName: r'DISABLED')
  static const EmployeeListResponseDtoOutputItemsInnerStatusEnum DISABLED = _$employeeListResponseDtoOutputItemsInnerStatusEnum_DISABLED;

  static Serializer<EmployeeListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$employeeListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const EmployeeListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<EmployeeListResponseDtoOutputItemsInnerStatusEnum> get values => _$employeeListResponseDtoOutputItemsInnerStatusEnumValues;
  static EmployeeListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$employeeListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

