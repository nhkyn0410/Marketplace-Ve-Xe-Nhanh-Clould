//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/route_response_dto_output_stops_inner.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'route_response_dto_output.g.dart';

/// RouteResponseDtoOutput
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [status] 
/// * [totalDistanceMeters] 
/// * [totalDurationSeconds] 
/// * [metricsSource] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [note] 
/// * [stops] 
@BuiltValue()
abstract class RouteResponseDtoOutput implements Built<RouteResponseDtoOutput, RouteResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'status')
  RouteResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'totalDistanceMeters')
  int get totalDistanceMeters;

  @BuiltValueField(wireName: r'totalDurationSeconds')
  int get totalDurationSeconds;

  @BuiltValueField(wireName: r'metricsSource')
  RouteResponseDtoOutputMetricsSourceEnum get metricsSource;
  // enum metricsSourceEnum {  GOONG,  ESTIMATE,  };

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'stops')
  BuiltList<RouteResponseDtoOutputStopsInner> get stops;

  RouteResponseDtoOutput._();

  factory RouteResponseDtoOutput([void updates(RouteResponseDtoOutputBuilder b)]) = _$RouteResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RouteResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RouteResponseDtoOutput> get serializer => _$RouteResponseDtoOutputSerializer();
}

class _$RouteResponseDtoOutputSerializer implements PrimitiveSerializer<RouteResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [RouteResponseDtoOutput, _$RouteResponseDtoOutput];

  @override
  final String wireName = r'RouteResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RouteResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(RouteResponseDtoOutputStatusEnum),
    );
    yield r'totalDistanceMeters';
    yield serializers.serialize(
      object.totalDistanceMeters,
      specifiedType: const FullType(int),
    );
    yield r'totalDurationSeconds';
    yield serializers.serialize(
      object.totalDurationSeconds,
      specifiedType: const FullType(int),
    );
    yield r'metricsSource';
    yield serializers.serialize(
      object.metricsSource,
      specifiedType: const FullType(RouteResponseDtoOutputMetricsSourceEnum),
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
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'stops';
    yield serializers.serialize(
      object.stops,
      specifiedType: const FullType(BuiltList, [FullType(RouteResponseDtoOutputStopsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RouteResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RouteResponseDtoOutputBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RouteResponseDtoOutputStatusEnum),
          ) as RouteResponseDtoOutputStatusEnum;
          result.status = valueDes;
          break;
        case r'totalDistanceMeters':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalDistanceMeters = valueDes;
          break;
        case r'totalDurationSeconds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalDurationSeconds = valueDes;
          break;
        case r'metricsSource':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RouteResponseDtoOutputMetricsSourceEnum),
          ) as RouteResponseDtoOutputMetricsSourceEnum;
          result.metricsSource = valueDes;
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
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'stops':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(RouteResponseDtoOutputStopsInner)]),
          ) as BuiltList<RouteResponseDtoOutputStopsInner>;
          result.stops.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RouteResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RouteResponseDtoOutputBuilder();
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


class RouteResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const RouteResponseDtoOutputStatusEnum ACTIVE = _$routeResponseDtoOutputStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const RouteResponseDtoOutputStatusEnum INACTIVE = _$routeResponseDtoOutputStatusEnum_INACTIVE;

  static Serializer<RouteResponseDtoOutputStatusEnum> get serializer => _$routeResponseDtoOutputStatusEnumSerializer;

  const RouteResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<RouteResponseDtoOutputStatusEnum> get values => _$routeResponseDtoOutputStatusEnumValues;
  static RouteResponseDtoOutputStatusEnum valueOf(String name) => _$routeResponseDtoOutputStatusEnumValueOf(name);
}

class RouteResponseDtoOutputMetricsSourceEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GOONG')
  static const RouteResponseDtoOutputMetricsSourceEnum GOONG = _$routeResponseDtoOutputMetricsSourceEnum_GOONG;
  @BuiltValueEnumConst(wireName: r'ESTIMATE')
  static const RouteResponseDtoOutputMetricsSourceEnum ESTIMATE = _$routeResponseDtoOutputMetricsSourceEnum_ESTIMATE;

  static Serializer<RouteResponseDtoOutputMetricsSourceEnum> get serializer => _$routeResponseDtoOutputMetricsSourceEnumSerializer;

  const RouteResponseDtoOutputMetricsSourceEnum._(String name): super(name);

  static BuiltSet<RouteResponseDtoOutputMetricsSourceEnum> get values => _$routeResponseDtoOutputMetricsSourceEnumValues;
  static RouteResponseDtoOutputMetricsSourceEnum valueOf(String name) => _$routeResponseDtoOutputMetricsSourceEnumValueOf(name);
}

